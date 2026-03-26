const FabricService = require('../services/FabricService');
const PowerBIService = require('../services/PowerBIService');

const FabricController = {

  /**
   * POST /api/admin/fabric/sync
   * Trigger desde el frontend (Admin) para ejecutar predicción incremental
   * y enviar resultados a Microsoft Fabric EventStream.
   * Si están configurados POWERBI_ACCESS_TOKEN y POWERBI_STREAMING_DATASET_ID,
   * envía además el snapshot "última predicción por programa" al Dataset de Streaming de Power BI.
   */
  async sincronizarFabric(req, res) {
    try {

      const { enviar_a_fabric = true } = req.body;

      console.log('[Fabric] Iniciando sincronización incremental...');

      const resultado = await FabricService.ejecutarPrediccionIncremental({
        enviarAPowerBI: enviar_a_fabric
      });

      let powerbi = null;
      if (PowerBIService.isConfigured()) {
        powerbi = await PowerBIService.enviarSnapshotStreaming();
        if (resultado) resultado.powerbi = powerbi;
      }

      return res.json({
        ok: true,
        message: 'Sincronización completada correctamente',
        data: resultado
      });

    } catch (error) {

      console.error('[Fabric] Error en sincronización:', error.message);

      return res.status(500).json({
        ok: false,
        message: 'Error durante la sincronización con Fabric',
        error: error.message
      });

    }
  },

  /**
   * GET /api/admin/fabric/predicciones
   * Retorna las últimas predicciones de demanda guardadas en BD.
   */
  async obtenerPredicciones(req, res) {
    try {

      const predicciones = await FabricService.obtenerUltimasPredicciones();

      return res.json({
        ok: true,
        data: predicciones
      });

    } catch (error) {

      return res.status(500).json({
        ok: false,
        message: 'Error obteniendo predicciones',
        error: error.message
      });

    }
  }

};

module.exports = FabricController;
