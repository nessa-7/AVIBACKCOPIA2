const TestService = require("../services/TestService");

const TestController = {

    async pretest(req, res) {
    try {
      const { aspiranteId, answers } = req.body;

      const session_id = crypto.randomUUID();

      const data = await TestService.analyzePretest(
        aspiranteId,
        answers,
        session_id
      );

      res.json(data);

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error en pretest" });
    }


    console.log(req.body);
  },

  // Iniciar test
  async start(req, res) {
    try {
      const { aspiranteId } = req.body;

      const data = await TestService.startTest(aspiranteId);

      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error iniciando test" });
    }
  },


  // Siguiente pregunta
  async nextQuestion(req, res) {
    try {
      const { testId, riasec_scores, session_id } = req.body;

      const pregunta = await TestService.nextQuestion(
        testId,
        riasec_scores,
        session_id
      );

      res.json(pregunta);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error obteniendo pregunta" });
    }
  },


  // Guardar respuesta
  async saveAnswer(req, res) {
    try {
      const respuesta = await TestService.saveAnswer(req.body);

      res.json(respuesta);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error guardando respuesta" });
    }
  },


  // Finalizar test
  async finalizar(req, res) {
    try {
      const { reporteId, riasec_scores } = req.body;

      const resultado = await TestService.finalizarTest(
        reporteId,
        riasec_scores
      );

      res.json(resultado);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error finalizando test" });
    }
  }

};

module.exports = TestController;