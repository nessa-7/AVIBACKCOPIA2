const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const IA_URL = process.env.IA_URL || "http://localhost:8000";

const TestService = {

async analyzePretest(reporteId, aspiranteId, answers, session_id) {

  if (!answers || answers.length !== 5) {
    throw new Error("Pretest incompleto");
  }

  for (let i = 0; i < answers.length; i++) {

    await prisma.rESPUESTAS_ASPIRANTE.create({
      data: {

        texto: answers[i],
        valor: null,

        aspirante: {
          connect: { idASPIRANTE: aspiranteId }
        },

        pregunta: {
          connect: { idPREGUNTAS: i + 1 }
        },

        reporte: {
          connect: { idREPORTE: reporteId }
        }

      }
    });

  }

  const response = await fetch(`${IA_URL}/analyze-pretest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      answers,
      session_id
    })
  });

  const data = await response.json();

  await prisma.rEPORTE.update({
    where: {
      idREPORTE: reporteId
    },
    data: {
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
    reporteId,
    scores: data.scores,
    summary: data.summary
  };

},

async startTest(aspiranteId) {

  if (!aspiranteId) {
    throw new Error("aspiranteId requerido");
  }

  const reporteNuevo = await prisma.rEPORTE.create({
    data: {
      aspirante: {
        connect: { idASPIRANTE: aspiranteId }
      },
      test: {
        connect: { idTEST: 1 }
      }
    }
  });

  return {
    reporteId: reporteNuevo.idREPORTE,
    testId: 1
  };

},

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

async saveAnswer({ aspiranteId, preguntaId, valor, texto, reporteId }) {

  const respuesta = await prisma.rESPUESTAS_ASPIRANTE.create({
    data: {

      valor: valor ?? null,
      texto: texto ?? null,

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

async finalizarTest(reporteId, riasec_scores) {

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

  const response = await fetch(`${IA_URL}/result`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(riasec_scores)
  });

  const resultadoIA = await response.json();

  await prisma.rEPORTE.update({
    where: { idREPORTE: reporteId },
    data: {
      explicacion: resultadoIA.explanation
    }
  });

  for (const rec of resultadoIA.recommendations) {

    const programa = await prisma.pROGRAMA.findFirst({
      where: { 
        nombre: {
          contains: rec.name,
        }
      }
    });

    if (programa) {

      const nuevaRecomendacion = await prisma.rECOMENDACION.create({
        data: {
          nombre: rec.name,
          descripcion: rec.reason,
          ranking: null,
          programaId: programa.idPROGRAMA,
          reporteId
        }
      });

      rec.AR = programa.AR;
      rec.idRECOMENDACION = nuevaRecomendacion.idRECOMENDACION;
      rec.programaId = programa.idPROGRAMA;
      rec.reporteId = reporteId;
    }

  }
  console.log("resultadoIA:", resultadoIA);

  return {
    reporte: reporteActualizado,
    resultadoIA
  };

},

// guardar ranking de los 3 programas
async guardarRankings(rankings) {

  if (!Array.isArray(rankings)) {
    throw new Error("Debe enviar un arreglo de rankings");
  }

  for (const r of rankings) {
    console.log('guardarRankings r=', JSON.stringify(r));

    const maybeId = Number(r.idRECOMENDACION);
    if (!Number.isNaN(maybeId) && Number.isInteger(maybeId) && maybeId > 0) {
      try {
        await prisma.rECOMENDACION.update({
          where: { idRECOMENDACION: maybeId },
          data: { ranking: r.ranking },
        });
        continue;
      } catch (error) {
        if (error.code !== 'P2025') throw error;
        console.warn(`No se encontró RECOMENDACION id=${maybeId}, intentando fallback...`);
      }
    }

    if (r.idRECOMENDACION != null && (Number.isNaN(maybeId) || !Number.isInteger(maybeId) || maybeId <= 0)) {
      console.warn('idRECOMENDACION proporcionado inválido', r.idRECOMENDACION);
    }

    // Fallback 1: programaId + reporteId
    if (r.programaId && r.reporteId) {
      let existing = await prisma.rECOMENDACION.findFirst({
        where: {
          programaId: r.programaId,
          reporteId: r.reporteId,
        },
      });

      if (existing) {
        await prisma.rECOMENDACION.update({
          where: { idRECOMENDACION: existing.idRECOMENDACION },
          data: { ranking: r.ranking },
        });
      } else {
        existing = await prisma.rECOMENDACION.create({
          data: {
            nombre: r.nombre || `Programa ${r.programaId}`,
            descripcion: r.descripcion || "Ranking asignado manualmente",
            ranking: r.ranking,
            programaId: r.programaId,
            reporteId: r.reporteId,
          },
        });
      }
      continue;
    }

    // Fallback 2: nombre + reporteId
    if (r.nombre && r.reporteId) {
      let existing = await prisma.rECOMENDACION.findFirst({
        where: {
          nombre: r.nombre,
          reporteId: r.reporteId,
        },
      });

      if (existing) {
        await prisma.rECOMENDACION.update({
          where: { idRECOMENDACION: existing.idRECOMENDACION },
          data: { ranking: r.ranking },
        });
      } else {
        await prisma.rECOMENDACION.create({
          data: {
            nombre: r.nombre,
            descripcion: r.descripcion || "Ranking asignado manualmente",
            ranking: r.ranking,
            programaId: r.programaId || 0,
            reporteId: r.reporteId,
          },
        });
      }
      continue;
    }

    throw new Error("Datos de ranking incompletos: falta idRECOMENDACION o programaId/reporteId o nombre/reporteId");
  }

  return { message: "Rankings guardados correctamente" };

},

// obtener puntaje total por programa
async obtenerRankingProgramas() {

  const ranking = await prisma.rECOMENDACION.groupBy({
    by: ["programaId"],
    _sum: {
      ranking: true
    },
    orderBy: {
      _sum: {
        ranking: "desc"
      }
    }
  });

  const resultado = [];

  for (const r of ranking) {

    const programa = await prisma.pROGRAMA.findUnique({
      where: {
        idPROGRAMA: r.programaId
      },
      select: {
        nombre: true
      }
    });

    resultado.push({
      programaId: r.programaId,
      nombre: programa?.nombre || "Programa desconocido",
      puntajeTotal: r._sum.ranking ?? 0
    });

  }

  return resultado;

}
};

module.exports = TestService;