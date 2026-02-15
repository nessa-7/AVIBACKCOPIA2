const express = require('express');
const router = express.Router();
const ProgramasController = require('../controllers/ProgramasController');

router.get('/programas', ProgramasController.getProgramas);

router.post('/programas', ProgramasController.crearPrograma);

router.put('/programas/:id/estado', ProgramasController.cambiarEstado);

module.exports = router;
