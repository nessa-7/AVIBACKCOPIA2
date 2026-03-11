const AprendizController = require('../controllers/AprendizController');
const express = require('express');
const router = express.Router();

const verificarToken = require("../middleware/authMiddleware")
const verificarRol = require("../middleware/verificarRol")

router.use(verificarToken)
router.use(verificarRol("admin"))

router.get("/admin/aprendices", AprendizController.listarAprendices)
router.post("/admin/aprendices", AprendizController.crearAprendiz)
router.put("/admin/aprendices/:id", AprendizController.actualizarAprendiz)
router.patch("/admin/aprendices/:id/estado", AprendizController.cambiarEstadoAprendiz)

router.get("/admin/aprendices/:id/prediccion", AprendizController.predecirDesercion);
router.get("/admin/aprendices/riesgo-desercion-programas",AprendizController.riesgoDesercionProgramas);
router.get("/predicciones", AprendizController.listarPredicciones);

module.exports = router;