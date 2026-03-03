const express = require('express');
const router = express.Router();
const PerfilController = require('../controllers/PerfilController');
const verificarToken = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

function maybeUploadFoto(req, res, next) {
  if (req.is('multipart/form-data')) {
    return upload.single('foto')(req, res, next);
  }
  return next();
}

router.get('/perfilaspirante', verificarToken, PerfilController.obtenerPerfil);
router.patch('/perfilaspirante/editar', verificarToken, maybeUploadFoto, PerfilController.actualizarPerfil);

module.exports = router;
