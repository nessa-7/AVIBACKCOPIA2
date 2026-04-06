const FabricService = require('../services/FabricService');
const DashboardDemandaService = require('../services/DashboardDemandaService');

const FabricController = {

  // POST /api/admin/fabric/sync — Predicción incremental
  async sincronizarFabric(req, res) {
    try {
      const resultado = await FabricService.ejecutarPrediccionIncremental({ enviarAPowerBI: false });
      return res.json({ ok: true, message: 'Sincronización completada', data: resultado });
    } catch (error) {
      console.error('[Fabric] Error en sincronización:', error.message);
      return res.status(500).json({ ok: false, message: 'Error durante la sincronización', error: error.message });
    }
  },

  // GET /api/admin/fabric/predicciones — Últimas predicciones guardadas en BD
  async obtenerPredicciones(req, res) {
    try {
      const predicciones = await FabricService.obtenerUltimasPredicciones();
      return res.json({ ok: true, data: predicciones });
    } catch (error) {
      return res.status(500).json({ ok: false, message: 'Error obteniendo predicciones', error: error.message });
    }
  },

  // GET /api/admin/dashboard — Datos del dashboard de demanda para el frontend
  async getDashboard(req, res) {
    try {
      const data = await DashboardDemandaService.getDashboardData();
      return res.json(data);
    } catch (error) {
      console.error('[Dashboard] Error:', error.message);
      return res.status(500).json({ ok: false, message: 'Error obteniendo datos del dashboard', error: error.message });
    }
  }

};

module.exports = FabricController;
