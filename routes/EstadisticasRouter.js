const express = require('express')
const router = express.Router()
const EstadisticasController = require('../controllers/EstadisticasController')

router.get('/estadisticas/test', EstadisticasController.getTestsRealizados)
router.get('/estadisticas/test/meses', EstadisticasController.getTestsPorMes)
router.get('/estadisticas/programas', EstadisticasController.getProgramasMasRecomendados)
router.get('/estadisticas/programas/meses', EstadisticasController.getProgramaMes)
router.get('/estadisticas/listarprogramas', EstadisticasController.getProgramas)

router.get("/estadisticas/aspirante/contador", EstadisticasController.getTotalAspirantes)
router.get("/estadisticas/tests-completados", EstadisticasController.getReportesCompletados);
router.get("/estadisticas/aspirante/test/:id",EstadisticasController.getTestsCompletadosPorAspirante);
router.get("/estadisticas/programas-nivel",EstadisticasController.getAspirantesPorProgramaNivel);

module.exports = router
