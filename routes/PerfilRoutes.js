const express = require('express');
const router = express.Router();
const PerfilController = require('../controllers/PerfilController');
const verificarToken = require('../middleware/authMiddleware')

router.get('/perfilaspirante', verificarToken, PerfilController.obtenerPerfil);

module.exports = router;
