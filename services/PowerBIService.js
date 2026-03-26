/**
 * PowerBIService — Envío al Dataset de Streaming de Power BI.
 * Solo envía datos únicos y actualizados (última predicción por programa).
 * Requiere POWERBI_ACCESS_TOKEN y POWERBI_STREAMING_DATASET_ID en .env.
 */
const FabricService = require('./FabricService');

const POWERBI_ACCESS_TOKEN         = process.env.POWERBI_ACCESS_TOKEN;
const POWERBI_STREAMING_DATASET_ID = process.env.POWERBI_STREAMING_DATASET_ID;
const POWERBI_STREAMING_TABLE_NAME = process.env.POWERBI_STREAMING_TABLE_NAME || 'DemandaProgramas';
const POWERBI_API_BASE             = 'https://api.powerbi.com/v1.0/myorg';

function isConfigured() {
  return Boolean(POWERBI_ACCESS_TOKEN && POWERBI_STREAMING_DATASET_ID);
}

/**
 * Envía el snapshot "última predicción por programa" al Dataset de Streaming.
 * Cada fila tiene: programa, nivel, demanda, tendencia, confianza, trimestre_objetivo, accion_sugerida, fecha, ranking.
 * @returns {{ enviados: number, error?: string } | null} null si no está configurado.
 */
async function enviarSnapshotStreaming() {
  if (!isConfigured()) {
    return null;
  }

  try {
    const filas = await FabricService.obtenerUltimaPrediccionPorPrograma();
    const rows = filas.map((p, index) => ({
      programa:            String(p.programa ?? ''),
      nivel:               String(p.nivel ?? ''),
      demanda:             Number(p.demanda),
      tendencia:           String(p.tendencia ?? ''),
      confianza:           Number(p.confianza),
      trimestre_objetivo:  String(p.trimestre ?? ''),
      accion_sugerida:     String(p.accion ?? ''),
      fecha:               p.fecha ? new Date(p.fecha).toISOString() : '',
      ranking:             index + 1,
    }));

    if (rows.length === 0) {
      return { enviados: 0 };
    }

    const url = `${POWERBI_API_BASE}/datasets/${POWERBI_STREAMING_DATASET_ID}/tables/${POWERBI_STREAMING_TABLE_NAME}/rows`;

    const res = await fetch(url, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${POWERBI_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({ rows }),
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      const message = errorBody?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
      throw new Error(message);
    }

    console.log(`[PowerBI] ✅ Streaming: ${rows.length} filas enviadas`);
    return { enviados: rows.length };

  } catch (err) {
    console.error('[PowerBI] Error enviando a Streaming Dataset:', err.message);
    return { enviados: 0, error: err.message };
  }
}

module.exports = {
  isConfigured,
  enviarSnapshotStreaming,
};
