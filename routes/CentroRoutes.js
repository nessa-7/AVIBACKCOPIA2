const express = require("express");
const router = express.Router();
const CentrosController = require("../controllers/CentroController");

router.get("/centros", CentrosController.getCentros);

module.exports = router;
