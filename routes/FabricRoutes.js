const express = require('express');
const router = express.Router();
const FabricController = require('../controllers/FabricController');
const verificarToken = require('../middleware/authMiddleware');

// POST /api/admin/fabric/sync — Predicción incremental (sin Power BI)
router.post('/admin/fabric/sync', verificarToken, FabricController.sincronizarFabric);

// GET /api/admin/fabric/predicciones — Últimas predicciones en BD
router.get('/admin/fabric/predicciones', verificarToken, FabricController.obtenerPredicciones);

// GET /api/admin/dashboard — Datos enriquecidos para el dashboard frontend
router.get('/admin/dashboard', verificarToken, FabricController.getDashboard);

module.exports = router;
