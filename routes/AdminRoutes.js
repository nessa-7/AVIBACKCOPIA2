const AdminController = require('../controllers/AdminController');
const express = require('express');
const router = express.Router();

router.get("/admins", AdminController.getAdmin);
router.patch("/admins/:id", AdminController.actualizarAdmin);
router.patch("/admins/:id/status", AdminController.cambiarEstadoAdmin);

router.get("/admin/dashboard/desercion", AdminController.dashboardDesercion);

// Endpoint público para Powerbi, es publico para evitar problemas por jwt y tokens
router.get("/powerbi/desercion", AdminController.powerbiDesercion);

module.exports = router;
