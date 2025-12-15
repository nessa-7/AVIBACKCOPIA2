const { respuestas, reportes, areas } = require('../data/resultados');

class ResultadosService {

  async getRespuestasByAspirante(aspiranteId) {
    return respuestas.filter(
      r => r.aspiranteId === Number(aspiranteId)
    );
  }

  async crearReporte(data) {
    const { aspiranteId, testId, areasIds, idAmbiente } = data;

    const areasRelacionadas = areas.filter(a =>
      areasIds.includes(a.id_area)
    );

    const reporte = {
      idREPORTE: reportes.length + 1,
      Fecha: new Date(),
      aspirante: { id: aspiranteId },
      test: { id: testId },
      areas: areasRelacionadas,
      ambiente: idAmbiente
    };

    reportes.push(reporte);
    return reporte;
  }

  async getReporte(aspiranteId) {
    return reportes.find(
      r => r.aspirante.id === Number(aspiranteId)
    );
  }
}

module.exports = new ResultadosService();
