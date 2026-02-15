const AspiranteController = require('../controllers/AspiranteController');
const express = require('express');
const router = express.Router();

router.get("/aspirantes", AspiranteController.getAspirantes);
router.patch("/aspirantes/:id", AspiranteController.actualizarAspirante);
router.patch("/aspirantes/:id/status", AspiranteController.cambiarEstadoAspirante);

module.exports = router;

