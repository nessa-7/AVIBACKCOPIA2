const express = require('express');
const router = express.Router();
const FabricController = require('../controllers/FabricController');

// POST /api/admin/fabric/sync — Trigger: predicción incremental + envío a Fabric/PowerBI
router.post('/admin/fabric/sync', FabricController.sincronizarFabric);

// GET /api/admin/fabric/predicciones — Últimas predicciones guardadas en BD
router.get('/admin/fabric/predicciones', FabricController.obtenerPredicciones);

module.exports = router;
