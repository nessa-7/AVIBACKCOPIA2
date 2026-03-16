const TestService = require("../services/TestService");
const crypto = require("crypto");

const TestController = {

  async pretest(req, res) {
    try {

      const { aspiranteId, answers, reporteId } = req.body;

      if (!aspiranteId || !answers) {
        return res.status(400).json({
          error: "Datos incompletos"
        });
      }

      const session_id = crypto.randomUUID();

      const data = await TestService.analyzePretest(
        reporteId,
        aspiranteId,
        answers,
        session_id
      );

      res.json(data);

    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Error en pretest"
      });
    }
  },

  // Iniciar test
  async start(req, res) {
    try {

      const { aspiranteId } = req.body;

      const data = await TestService.startTest(aspiranteId);

      res.json(data);

    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Error iniciando test"
      });
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

      console.error("ERROR NEXT QUESTION:", error);

      res.status(500).json({
        error: error.message
      });

    }
  },

  // Guardar respuesta
  async saveAnswer(req, res) {
    try {

      const respuesta = await TestService.saveAnswer(req.body);

      res.json(respuesta);

    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Error guardando respuesta"
      });
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
      res.status(500).json({
        error: "Error finalizando test"
      });
    }
  },

  // Guardar rankings de los programas
  async guardarRankings(req, res) {

    try {

      const { rankings } = req.body;

      const result = await TestService.guardarRankings(rankings);

      res.json(result);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        error: error.message
      });

    }

  },

  // Obtener puntaje total de programas (estadística)
  async rankingProgramas(req, res) {

    try {

      const ranking = await TestService.obtenerRankingProgramas();

      res.json(ranking);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        error: "Error obteniendo ranking de programas"
      });

    }

  }

};

module.exports = TestController;