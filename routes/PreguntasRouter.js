const PreguntasController = require('../controllers/PreguntasController');
const express = require('express');
const router = express.Router();

router.get("/cuestionario", PreguntasController.getPreguntas);

module.exports = router;