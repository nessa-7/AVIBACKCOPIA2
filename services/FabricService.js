const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';
const VENTANA_HORAS = 12; // No reprocesar programas con predicción más reciente que esto

const FabricService = {

  // Ejecuta predicción incremental para programas sin predicción reciente
  async ejecutarPrediccionIncremental({ enviarAPowerBI = false } = {}) {

    // 1. Cargar programas activos con sus aprendices y recomendaciones
    const programas = await prisma.pROGRAMA.findMany({
      include: {
        aprendices: {
          select: {
            idAPRENDIZ: true, estado: true, horas_inasistidas: true,
            predicciones: { orderBy: { fecha: 'desc' }, take: 1 }
          }
        },
        recomendaciones: { include: { reporte: { select: { puntajeR:true, puntajeI:true, puntajeA:true, puntajeS:true, puntajeE:true, puntajeC:true } } } },
        prediccionesDemanda: { orderBy: { fecha: 'desc' }, take: 1 }
      },
      where: { activo: true }
    });

    // 2. Filtrar programas que ya tienen predicción reciente (deduplicación capa 1)
    const ventanaMs = VENTANA_HORAS * 60 * 60 * 1000;
    const ahora     = Date.now();
    const programasYaActualizados = [];
    const programasAActualizar    = [];

    for (const prog of programas) {
      const ultima = prog.prediccionesDemanda[0];
      if (ultima && (ahora - new Date(ultima.fecha).getTime()) < ventanaMs) {
        programasYaActualizados.push(prog.idPROGRAMA);
      } else {
        programasAActualizar.push(prog);
      }
    }

    // 3. Contar aprendices sin predicción de deserción
    let aprendicesSinPrediccion = 0;
    for (const prog of programas)
      for (const apr of prog.aprendices)
        if (!apr.predicciones?.length) aprendicesSinPrediccion++;

    if (programasAActualizar.length === 0) {
      return {
        procesados: 0,
        omitidos_por_deduplicacion: programasYaActualizados.length,
        aprendices_sin_prediccion: aprendicesSinPrediccion,
        mensaje: `Todos los programas tienen predicciones recientes (< ${VENTANA_HORAS}h).`,
        predicciones: [],
      };
    }

    // 4. Construir payload para la IA
    let maxAspirantes = 1;
    const estadoStr = (a) => typeof a.estado === 'boolean' ? (a.estado ? 'activo' : 'desertor') : String(a.estado).toLowerCase();

    const payloadProgramas = programasAActualizar.map(prog => {
      const aprendices      = prog.aprendices;
      const totalAprendices = aprendices.length || 1;
      const desertores      = aprendices.filter(a => ['desertor','inasistencia','retiro voluntario','retiro'].includes(estadoStr(a))).length;
      const exitosos        = aprendices.filter(a => ['certificado','en formacion','activo'].includes(estadoStr(a))).length;
      const reportes        = prog.recomendaciones.map(r => r.reporte).filter(Boolean);
      const recomendaciones = prog.recomendaciones.filter(Boolean);
      const n               = reportes.length || 1;
      const n_rec           = recomendaciones.length || 1;
      if (reportes.length > maxAspirantes) maxAspirantes = reportes.length;
      const riasec = ['R','I','A','S','E','C'].reduce((obj, k) => {
        obj[`puntaje${k}`] = parseFloat((reportes.reduce((s,r) => s + (r[`puntaje${k}`] || 0), 0) / n).toFixed(2));
        return obj;
      }, {});
      return {
        programaId: prog.idPROGRAMA,
        nombre_programa: prog.nombre,
        ...riasec,
        ranking_promedio: parseFloat((recomendaciones.reduce((s,r) => s + (r.ranking||0), 0) / n_rec).toFixed(2)),
        diversidad_barrios: 0,
        institucion_principal: '',
        total_aspirantes: reportes.length,
        aprendices_activos: aprendices.length,
        tasa_desercion: parseFloat((desertores / totalAprendices).toFixed(3)),
        tasa_exito: parseFloat((exitosos / totalAprendices).toFixed(3)),
        promedio_horas_inasistidas: aprendices.length
          ? parseFloat((aprendices.reduce((s,a) => s + (a.horas_inasistidas||0),0) / aprendices.length).toFixed(2)) : 0,
      };
    });

    // 5. Llamar a la IA (FastAPI)
    const respIA = await fetch(`${FASTAPI_URL}/predict-incremental`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ programas: payloadProgramas, enviar_a_powerbi: enviarAPowerBI, max_aspirantes_ref: maxAspirantes }),
    });

    if (!respIA.ok) throw new Error(`FastAPI error ${respIA.status}: ${await respIA.text()}`);

    const respIAData = await respIA.json();
    const { resultados = [], omitidos: iaErrCount } = respIAData;

    // 6. Guardar predicciones en BD
    const guardadas = [];
    for (const pred of resultados) {
      try {
        const reg = await prisma.pREDICCION_DEMANDA.create({
          data: {
            demanda: pred.demanda_predicha,
            tendencia: pred.tendencia,
            confianza_prediccion: pred.confianza_prediccion,
            trimestre_objetivo: pred.trimestre_objetivo,
            accion_sugerida: pred.accion_sugerida,
            programaId: pred.programaId,
          }
        });
        guardadas.push(reg);
      } catch (e) {
        console.error(`[Fabric] Error guardando prediccion prog ${pred.programaId}:`, e.message);
      }
    }

    console.log(`[Fabric] ${guardadas.length} predicciones guardadas | ${programasYaActualizados.length} omitidas`);
    return {
      procesados: guardadas.length,
      omitidos_por_deduplicacion: programasYaActualizados.length,
      aprendices_sin_prediccion: aprendicesSinPrediccion,
      fastapi_errores: iaErrCount || 0,
      mensaje: `${guardadas.length} programas actualizados · ${programasYaActualizados.length} omitidos por deduplicación`,
      predicciones: resultados,
    };
  },

  // Última predicción por programa (la más reciente, sin duplicados)
  async obtenerUltimaPrediccionPorPrograma() {
    const rows = await prisma.$queryRawUnsafe(`
      SELECT t.idPREDICCION, t.fecha, t.demanda, t.tendencia, t.confianza_prediccion,
             t.trimestre_objetivo, t.accion_sugerida, t.programaId,
             p.nombre AS programa_nombre, p.nivel AS programa_nivel
      FROM (
        SELECT *, ROW_NUMBER() OVER (PARTITION BY programaId ORDER BY fecha DESC) AS rn
        FROM PREDICCION_DEMANDA
      ) t
      INNER JOIN PROGRAMA p ON p.idPROGRAMA = t.programaId
      WHERE t.rn = 1
      ORDER BY t.demanda DESC
    `);
    return rows.map(r => ({
      id: r.idPREDICCION, programa: r.programa_nombre, nivel: r.programa_nivel,
      demanda: Number(r.demanda), tendencia: r.tendencia,
      confianza: Number(r.confianza_prediccion), trimestre: r.trimestre_objetivo,
      accion: r.accion_sugerida, fecha: r.fecha,
    }));
  },

  // Alias para el dashboard
  async obtenerUltimasPredicciones() {
    return this.obtenerUltimaPrediccionPorPrograma();
  }

};

module.exports = FabricService;
