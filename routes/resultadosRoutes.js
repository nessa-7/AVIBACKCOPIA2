const express = require('express');
const router = express.Router();
const resultadosController = require('../controllers/resultadosController');

// GET resultados (antes /respuestas)
router.get('/resultados/:aspiranteId', resultadosController.getRespuestas);

// POST crear reporte
router.post('/resultados', resultadosController.postResultados);

// GET reporte final
router.get('/reporte/:aspiranteId', resultadosController.getReporte);

module.exports = router;
