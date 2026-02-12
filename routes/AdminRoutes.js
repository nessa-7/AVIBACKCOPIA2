const AdminController = require('../controllers/AdminController');
const express = require('express');
const router = express.Router();

router.get("/admins", AdminController.getAdmin);
router.patch("/admins/:id", AdminController.actualizarAdmin);
router.patch("/admins/:id/status", AdminController.cambiarEstadoAdmin);

module.exports = router;
