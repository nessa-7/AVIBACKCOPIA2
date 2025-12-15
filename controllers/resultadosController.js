const resultadosService = require('../services/resultadosService');

class ResultadosController {

  // GET respuestas por aspirante
  async getRespuestas(req, res) {
    const { aspiranteId } = req.params;
    const respuestas = await resultadosService.getRespuestasByAspirante(aspiranteId);
    res.json(respuestas);
  }

  // POST crear reporte
  async postResultados(req, res) {
    const { aspiranteId, testId, areasIds, idAmbiente } = req.body;

    const reporte = await resultadosService.crearReporte({
      aspiranteId,
      testId,
      areasIds,
      idAmbiente
    });

    res.json(reporte);
  }

  // GET reporte final
  async getReporte(req, res) {
    const { aspiranteId } = req.params;
    const reporte = await resultadosService.getReporte(aspiranteId);

    if (!reporte) {
      res.json({ mensaje: "No existe reporte para este aspirante" });
      return;
    }

    res.json({
      fecha: reporte.Fecha,
      aspirante: reporte.aspirante,
      programas_recomendados: reporte.areas.flatMap(area => area.programas),
      test: reporte.test
    });
  }
}

module.exports = new ResultadosController();
