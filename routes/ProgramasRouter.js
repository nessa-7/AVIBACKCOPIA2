const express = require('express');
const router = express.Router();
const ProgramasController = require('../controllers/ProgramasController');

router.get('/programas', ProgramasController.getProgramas);


const verificarToken = require("../middleware/authMiddleware")
const verificarRol = require("../middleware/verificarRol")

router.use(verificarToken)
router.use(verificarRol("admin"))

router.post('/programas', ProgramasController.crearPrograma);
router.put('/programas/:id/estado', ProgramasController.cambiarEstado);
router.put('/programas/:id', ProgramasController.editarPrograma);

module.exports = router;
