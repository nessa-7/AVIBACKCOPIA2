const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DashboardDemandaService = {

  // Retorna KPIs, predicciones, historial y evolución trimestral para el dashboard
  async getDashboardData() {

    // 1. Últimas predicciones por programa (una por programa, la más reciente)
    const ultimasPorPrograma = await prisma.$queryRawUnsafe(`
      SELECT t.idPREDICCION, t.fecha, t.demanda, t.tendencia,
             t.confianza_prediccion, t.trimestre_objetivo,
             t.accion_sugerida, t.programaId,
             p.nombre AS programa_nombre, p.nivel AS programa_nivel
      FROM (
        SELECT *, ROW_NUMBER() OVER (PARTITION BY programaId ORDER BY fecha DESC) AS rn
        FROM PREDICCION_DEMANDA
      ) t
      INNER JOIN PROGRAMA p ON p.idPROGRAMA = t.programaId
      WHERE t.rn = 1
      ORDER BY t.demanda DESC
    `);

    if (!ultimasPorPrograma?.length) {
      return { ok: true, kpis: null, predicciones_ultima: [], historial: [], evolucion_trimestral: [], periodos: [] };
    }

    // 2. Evolución trimestral: promedio de demanda por trimestre
    const evolucionRaw = await prisma.$queryRawUnsafe(`
      SELECT trimestre_objetivo,
             AVG(demanda) AS demanda_promedio,
             MAX(demanda) AS demanda_maxima,
             MIN(demanda) AS demanda_minima,
             COUNT(*)     AS total_predicciones
      FROM PREDICCION_DEMANDA
      GROUP BY trimestre_objetivo
      ORDER BY trimestre_objetivo ASC
    `);

    // 3. Historial completo: última predicción por programa+trimestre
    const historialPorTrimestre = await prisma.$queryRawUnsafe(`
      SELECT t.idPREDICCION, t.fecha, t.demanda, t.tendencia,
             t.confianza_prediccion, t.trimestre_objetivo,
             t.accion_sugerida, t.programaId,
             p.nombre AS programa_nombre, p.nivel AS programa_nivel
      FROM (
        SELECT *, ROW_NUMBER() OVER (PARTITION BY programaId, trimestre_objetivo ORDER BY fecha DESC) AS rn
        FROM PREDICCION_DEMANDA
      ) t
      INNER JOIN PROGRAMA p ON p.idPROGRAMA = t.programaId
      WHERE t.rn = 1
      ORDER BY t.trimestre_objetivo ASC, t.demanda DESC
    `);

    // 4. Calcular KPIs
    const maxDemanda = ultimasPorPrograma.reduce((max, p) => Number(p.demanda) > Number(max.demanda) ? p : max, ultimasPorPrograma[0]);
    const minDemanda = ultimasPorPrograma.reduce((min, p) => Number(p.demanda) < Number(min.demanda) ? p : min, ultimasPorPrograma[0]);
    const promedioDemanda = ultimasPorPrograma.reduce((s, p) => s + Number(p.demanda), 0) / ultimasPorPrograma.length;

    // Tendencia dominante como recomendación de la IA
    const tendenciaCounts = {};
    for (const p of ultimasPorPrograma)
      tendenciaCounts[p.tendencia] = (tendenciaCounts[p.tendencia] || 0) + 1;
    const tendenciaDominante = Object.entries(tendenciaCounts).sort((a,b) => b[1]-a[1])[0]?.[0] ?? 'Media';

    // 5. Serializar (convierte BigInt/Decimal de MySQL a tipos JS)
    const serializar = (arr) => arr.map(r => ({
      id: Number(r.idPREDICCION), fecha: r.fecha,
      demanda: Number(r.demanda), tendencia: r.tendencia,
      confianza: Number(r.confianza_prediccion), trimestre: r.trimestre_objetivo,
      accion: r.accion_sugerida, programaId: Number(r.programaId),
      programa: r.programa_nombre, nivel: r.programa_nivel, es_ultima: false
    }));

    return {
      ok: true,
      kpis: {
        demanda_maxima:          Number(maxDemanda.demanda),
        programa_mayor_demanda:  maxDemanda.programa_nombre,
        programa_menor_demanda:  minDemanda.programa_nombre,
        demanda_minima:          Number(minDemanda.demanda),
        promedio_demanda:        parseFloat(promedioDemanda.toFixed(2)),
        tendencia_dominante:     tendenciaDominante,
        recomendacion_ia:        `Tendencia general: ${tendenciaDominante}. Se recomienda reforzar oferta en "${maxDemanda.programa_nombre}".`,
        trimestre_actual:        ultimasPorPrograma[0]?.trimestre_objetivo ?? 'N/A',
        fecha_ultima_prediccion: ultimasPorPrograma[0]?.fecha ?? null,
        total_programas:         ultimasPorPrograma.length,
      },
      predicciones_ultima: ultimasPorPrograma.map(r => ({
        id: Number(r.idPREDICCION), fecha: r.fecha,
        demanda: Number(r.demanda), tendencia: r.tendencia,
        confianza: Number(r.confianza_prediccion), trimestre: r.trimestre_objetivo,
        accion: r.accion_sugerida, programaId: Number(r.programaId),
        programa: r.programa_nombre, nivel: r.programa_nivel, es_ultima: true
      })),
      historial:            serializar(historialPorTrimestre),
      evolucion_trimestral: evolucionRaw.map(r => ({
        trimestre:          r.trimestre_objetivo,
        demanda_promedio:   parseFloat(Number(r.demanda_promedio).toFixed(2)),
        demanda_maxima:     Number(r.demanda_maxima),
        demanda_minima:     Number(r.demanda_minima),
        total_predicciones: Number(r.total_predicciones)
      })),
      periodos: [...new Set(historialPorTrimestre.map(r => r.trimestre_objetivo))].sort(),
    };
  }
};

module.exports = DashboardDemandaService;
