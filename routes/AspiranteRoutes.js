const AspiranteController = require('../controllers/AspiranteController');
const express = require('express');
const router = express.Router();

router.get("/aspirantes", AspiranteController.getAspirantes);
router.delete("/aspirantes/:id", AspiranteController.deleteAspirante);
router.patch("/aspirantes/:id", AspiranteController.actualizar);

module.exports = router;

