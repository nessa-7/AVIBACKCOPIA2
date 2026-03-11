const express = require("express");
const router = express.Router();
const TestController = require("../controllers/TestController");

const verificarToken = require("../middleware/authMiddleware")

router.post("/pretest", verificarToken, TestController.pretest);
router.post("/start", verificarToken, TestController.start);
router.post("/next-question", verificarToken, TestController.nextQuestion);
router.post("/answer", verificarToken, TestController.saveAnswer);
router.post("/finish", verificarToken, TestController.finalizar);

module.exports = router;