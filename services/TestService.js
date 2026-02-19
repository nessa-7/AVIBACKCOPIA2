const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const IA_URL = process.env.IA_URL || "http://localhost:8000";

const TestService = {

//preguntas pretest
    async analyzePretest(aspiranteId, answers, session_id) {

    const response = await fetch(`${IA_URL}/analyze-pretest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        answers,
        session_id
        })
    });

    const data = await response.json();

    const reporte = await prisma.rEPORTE.create({
        data: {
            aspirante:{
                 connect: { idASPIRANTE: aspiranteId }
            },
            test: {
                connect: { idTEST: 2 }
            },
            puntajeR: data.scores.R,
            puntajeI: data.scores.I,
            puntajeA: data.scores.A,
            puntajeS: data.scores.S,
            puntajeE: data.scores.E,
            puntajeC: data.scores.C
        }
    });

    return {
        session_id, 
        reporteId: reporte.idREPORTE,
        scores: data.scores,
        summary: data.summary
    };
    },

    
  //Iniciar test
  async startTest(aspiranteId) {

    const reporte = await prisma.rEPORTE.create({
        data: {
        aspirante:{
                 connect: { idASPIRANTE: aspiranteId }
        },
        test: {
            connect: { idTEST: 1 } 
        }
        }
    });

    return reporte;
    },


  //Obtener siguiente pregunta desde IA y guardarla
  async nextQuestion(testId, riasec_scores, session_id) {

    const response = await fetch(`${IA_URL}/next-question`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        session_id,
        riasec_scores
      })
    });

    const data = await response.json();

    // Guardar pregunta en BD
    const preguntaGuardada = await prisma.pREGUNTAS.create({
      data: {
        descripcion: data.question,
        perfilesRIASEC: data.category,
        generadaIA: true,
        testId: testId
      }
    });

    return preguntaGuardada;
  },


  //Guardar respuesta del aspirante
  async saveAnswer({ aspiranteId, preguntaId, valor, reporteId }) {

    const respuesta = await prisma.rESPUESTAS_ASPIRANTE.create({
        data: {
        valor,
        aspirante: {
            connect: { idASPIRANTE: aspiranteId }
        },
        pregunta: {
            connect: { idPREGUNTAS: preguntaId }
        },
        reporte: {
            connect: { idREPORTE: reporteId }
        }
        }
    });

    return respuesta;
    },


  //Calcular resultado final
async finalizarTest(reporteId, riasec_scores) {

  // Actualizar puntajes en el reporte
  const reporteActualizado = await prisma.rEPORTE.update({
    where: { idREPORTE: reporteId },
    data: {
      puntajeR: riasec_scores.R,
      puntajeI: riasec_scores.I,
      puntajeA: riasec_scores.A,
      puntajeS: riasec_scores.S,
      puntajeE: riasec_scores.E,
      puntajeC: riasec_scores.C
    }
  });

  // Llamar IA para recomendaciones
  const response = await fetch(`${IA_URL}/result`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(riasec_scores)
  });

    let resultadoIA;

        try {
        resultadoIA = await response.json();
        } catch (error) {
        console.error("La IA no devolvió JSON válido");
        throw new Error("Error en servicio IA");
        }

        if (!resultadoIA || !Array.isArray(resultadoIA.recommendations)) {
        throw new Error("La IA no devolvió recomendaciones válidas");
        }

  //GUARDAR recomendaciones en la BD 
  for (const rec of resultadoIA.recommendations) {

    const programa = await prisma.pROGRAMA.findFirst({
      where: { nombre: rec.name }
    });

    if (programa) {
      await prisma.rECOMENDACION.create({
        data: {
          nombre: rec.name,
          descripcion: rec.reason,
          programaId: programa.idPROGRAMA,
          reporteId
        }
      });
    }
  }

  //Retornar todo
  return {
    reporte: reporteActualizado,
    resultadoIA
  };
}

};

module.exports = TestService;