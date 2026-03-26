const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

// Ventana de deduplicación: no reprocesar si hay predicción más reciente que esto
const VENTANA_HORAS = 12;

const FabricService = {

  /**
   * ejecutarPrediccionIncremental
   * ══════════════════════════════
   * DOBLE CAPA DE DEDUPLICACIÓN:
   *   Capa 1 (Node.js): filtra programas con predicción < VENTANA_HORAS
   *   Capa 2 (FastAPI):  solo procesa lo que recibe → 0 duplicados en Fabric
   *
   * DEDUPLICACIÓN POR APRENDIZ (PREDICCION_DESERCION):
   *   También expone conteo de aprendices sin predicción de deserción
   *   para que el trigger muestre el estado completo de la BD.
   */
  async ejecutarPrediccionIncremental({ enviarAPowerBI = true } = {}) {

    // ── 1. Programas activos con métricas ─────────────────────────────
    const programas = await prisma.pROGRAMA.findMany({
      include: {
        aprendices: {
          select: {
            idAPRENDIZ:      true,
            estado:          true,
            horas_inasistidas: true,
            predicciones: {
              orderBy: { fecha: 'desc' },
              take: 1
            }
          }
        },
        recomendaciones: {
          include: {
            reporte: {
              select: {
                puntajeR: true,
                puntajeI: true,
                puntajeA: true,
                puntajeS: true,
                puntajeE: true,
                puntajeC: true
              }
            }
          }
        },
        prediccionesDemanda: {
          orderBy: { fecha: 'desc' },
          take: 1
        }
      },
      where: { activo: true }
    });

    // ── 2. CAPA 1 - Filtro incremental de demanda (programa) ───────────
    const ventanaMs = VENTANA_HORAS * 60 * 60 * 1000;
    const ahora     = Date.now();

    const programasYaActualizados = [];
    const programasAActualizar = [];

    for (const prog of programas) {
      const ultima = prog.prediccionesDemanda[0];
      if (ultima && (ahora - new Date(ultima.fecha).getTime()) < ventanaMs) {
        programasYaActualizados.push(prog.idPROGRAMA);
      } else {
        programasAActualizar.push(prog);
      }
    }

    // ── 3. Conteo de aprendices sin predicción de deserción ────────────
    let aprendicesSinPrediccion = 0;
    for (const prog of programas) {
      for (const apr of prog.aprendices) {
        if (!apr.predicciones || apr.predicciones.length === 0) {
          aprendicesSinPrediccion++;
        }
      }
    }

    if (programasAActualizar.length === 0) {
      return {
        procesados:                0,
        omitidos_por_deduplicacion: programasYaActualizados.length,
        aprendices_sin_prediccion:  aprendicesSinPrediccion,
        mensaje: `Todos los programas tienen predicciones recientes (< ${VENTANA_HORAS}h). Sin envíos a Power BI.`,
        predicciones: [],
        powerbi: null
      };
    }

    // ── 4. Construir payload enriquecido ───────────────────────────────
    // Calcular max aspirantes para normalización dinámica consistente
    let maxAspirantes = 1;

    const payloadProgramas = programasAActualizar.map(prog => {
      const aprendices      = prog.aprendices;
      const totalAprendices = aprendices.length || 1;

      // estado puede ser String ('desertor') o Boolean (true/false) según schema
      const estadoStr = (a) => {
        if (typeof a.estado === 'boolean') return a.estado ? 'activo' : 'desertor';
        return String(a.estado).toLowerCase();
      };

      const desertores = aprendices.filter(a =>
        ['desertor', 'inasistencia', 'retiro voluntario', 'retiro'].includes(estadoStr(a))
      ).length;

      const exitosos = aprendices.filter(a =>
        ['certificado', 'en formacion', 'activo'].includes(estadoStr(a))
      ).length;

      const tasaDesercion = parseFloat((desertores / totalAprendices).toFixed(3));
      const tasaExito     = parseFloat((exitosos   / totalAprendices).toFixed(3));

      const promedioHoras = aprendices.length
        ? parseFloat((aprendices.reduce((s, a) => s + (a.horas_inasistidas || 0), 0) / aprendices.length).toFixed(2))
        : 0;

      // Promedio RIASEC, ranking y métricas geográficas de aspirantes que eligieron este programa
      const reportes = prog.recomendaciones.map(r => r.reporte).filter(Boolean);
      const recomendaciones = prog.recomendaciones.filter(Boolean);
      const n        = reportes.length || 1;
      const n_rec    = recomendaciones.length || 1;

      if (reportes.length > maxAspirantes) maxAspirantes = reportes.length;

      const riasec = {
        puntajeR: parseFloat((reportes.reduce((s, r) => s + (r.puntajeR || 0), 0) / n).toFixed(2)),
        puntajeI: parseFloat((reportes.reduce((s, r) => s + (r.puntajeI || 0), 0) / n).toFixed(2)),
        puntajeA: parseFloat((reportes.reduce((s, r) => s + (r.puntajeA || 0), 0) / n).toFixed(2)),
        puntajeS: parseFloat((reportes.reduce((s, r) => s + (r.puntajeS || 0), 0) / n).toFixed(2)),
        puntajeE: parseFloat((reportes.reduce((s, r) => s + (r.puntajeE || 0), 0) / n).toFixed(2)),
        puntajeC: parseFloat((reportes.reduce((s, r) => s + (r.puntajeC || 0), 0) / n).toFixed(2)),
      };

      const ranking_promedio = parseFloat((recomendaciones.reduce((s, r) => s + (r.ranking || 0), 0) / n_rec).toFixed(2));

      return {
        programaId:                prog.idPROGRAMA,
        nombre_programa:           prog.nombre,
        ...riasec,
        ranking_promedio:          ranking_promedio,
        diversidad_barrios:        0,
        institucion_principal:     '',
        total_aspirantes:          reportes.length,
        aprendices_activos:        aprendices.length,
        tasa_desercion:            tasaDesercion,
        tasa_exito:                tasaExito,
        promedio_horas_inasistidas: promedioHoras,
      };
    });

    // ── 5. Llamar al FastAPI (solo los programas filtrados) ───────────
    const respIA = await fetch(`${FASTAPI_URL}/predict-incremental`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        programas:           payloadProgramas,
        enviar_a_powerbi:    enviarAPowerBI,
        max_aspirantes_ref:  maxAspirantes,
      }),
    });

    if (!respIA.ok) {
      const errorText = await respIA.text();
      throw new Error(`FastAPI error ${respIA.status}: ${errorText}`);
    }

    const respIAData = await respIA.json();
    const { resultados = [], powerbi, procesados: iaCount, omitidos: iaErrCount } = respIAData;

    // ── 6. Persistir en PREDICCION_DEMANDA (BD) ────────────────────────
    const guardadas = [];

    for (const pred of resultados) {
      try {
        const reg = await prisma.pREDICCION_DEMANDA.create({
          data: {
            demanda:              pred.demanda_predicha,
            tendencia:            pred.tendencia,
            confianza_prediccion: pred.confianza_prediccion,
            trimestre_objetivo:   pred.trimestre_objetivo,
            accion_sugerida:      pred.accion_sugerida,
            programaId:           pred.programaId,
          }
        });
        guardadas.push(reg);
      } catch (e) {
        console.error(`[PowerBI] Error guardando prediccion prog ${pred.programaId}:`, e.message);
      }
    }

    console.log(`[PowerBI] ✅ ${guardadas.length} predicciones guardadas | ${programasYaActualizados.length} omitidas (dedup)`);

    return {
      procesados:                 guardadas.length,
      omitidos_por_deduplicacion: programasYaActualizados.length,
      aprendices_sin_prediccion:  aprendicesSinPrediccion,
      fastapi_errores:            iaErrCount || 0,
      mensaje:                    `${guardadas.length} programas actualizados · ${programasYaActualizados.length} omitidos por deduplicación`,
      predicciones:               resultados,
      powerbi,
    };

  },

  /**
   * Última predicción por programa (una fila por programa, la más reciente).
   * Usa ROW_NUMBER() para eliminar duplicados; orden final por demanda DESC.
   * Fuente única para historial, Power BI GET y POST Streaming.
   */
  async obtenerUltimaPrediccionPorPrograma() {
    const sql = `
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
    `;
    const rows = await prisma.$queryRawUnsafe(sql);
    return rows.map((r) => ({
      id:        r.idPREDICCION,
      programa:  r.programa_nombre,
      nivel:     r.programa_nivel,
      demanda:   Number(r.demanda),
      tendencia: r.tendencia,
      confianza: Number(r.confianza_prediccion),
      trimestre: r.trimestre_objetivo,
      accion:    r.accion_sugerida,
      fecha:     r.fecha,
    }));
  },

  /**
   * Últimas predicciones para el dashboard (historial sin duplicados por programa).
   * Una fila por programa, la más reciente; ordenado de mayor a menor demanda.
   */
  async obtenerUltimasPredicciones() {
    return this.obtenerUltimaPrediccionPorPrograma();
  }

};

module.exports = FabricService;
