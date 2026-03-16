const express = require("express");
const router = express.Router();
const TestController = require("../controllers/TestController");


router.post("/pretest", TestController.pretest);
router.post("/start", TestController.start);
router.post("/next-question", TestController.nextQuestion);
router.post("/answer", TestController.saveAnswer);
router.post("/finish", TestController.finalizar);

router.post("/ranking", TestController.guardarRankings);
router.get("/ranking-programas", TestController.rankingProgramas);

module.exports = router;