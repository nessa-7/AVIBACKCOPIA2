const AdminController = require('../controllers/AdminController');
const express = require('express');
const router = express.Router();

// ── Endpoints PÚBLICOS (sin JWT — usados por Power BI / Fabric) ─────────────
router.get("/powerbi/desercion",  AdminController.powerbiDesercion);
router.get("/powerbi/demanda",    AdminController.powerbiDemandaProgramas);


const verificarToken = require("../middleware/authMiddleware")
const verificarRol = require("../middleware/verificarRol")

router.use(verificarToken)
router.use(verificarRol("admin"))

router.get("/admins", AdminController.getAdmin);
router.patch("/admins/:id", AdminController.actualizarAdmin);
router.patch("/admins/:id/status", AdminController.cambiarEstadoAdmin);

// ── Dashboard / IA ───────────────────────────────────────────────────────────
router.get("/admin/dashboard/desercion",  AdminController.dashboardDesercion);
router.get("/admin/demanda",              AdminController.demandaProgramas);
router.post("/admin/aprendices/upload",   AdminController.uploadAprendices);


module.exports = router;