const express = require("express");
const router = express.Router();
const ReportesController = require("../controllers/ReportesController");
const verificarToken = require("../middleware/authMiddleware");

router.get("/misreportes", verificarToken, ReportesController.misReportes);

router.get("/todos", verificarToken, ReportesController.todosReportes);

module.exports = router;