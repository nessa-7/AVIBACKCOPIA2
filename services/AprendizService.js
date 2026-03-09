const { PrismaClient } = require("@prisma/client");
const { predecirDesercion } = require("./IAService");

const prisma = new PrismaClient();

const AprendizService = {


  async crearAprendizDesdeAdmin(datos) {
    const aprendiz = await prisma.aPRENDIZ.create({
      data: {
        idAPRENDIZ: datos.idAPRENDIZ,
        tipoDocumento: datos.tipoDocumento,
        nombre: datos.nombre,
        apellidos: datos.apellidos,
        programaId: datos.programaId,
        horas_inasistidas: datos.horas_inasistidas || 0
      }
    });

    // Predicción automática al registrar el aprendiz
    try {
      const datosIA = {
        programaId: aprendiz.programaId,
        horas_inasistidas: aprendiz.horas_inasistidas
      };
      const resultado = await predecirDesercion(datosIA);
      if (resultado) {
        await prisma.pREDICCION_DESERCION.create({
          data: {
            riesgo: resultado.resultado ?? resultado,
            probabilidad: null,
            aprendizId: aprendiz.idAPRENDIZ
          }
        });
      }
    } catch (e) {
      console.error("Error guardando prediccion inicial:", e.message);
    }

    return aprendiz;
  },

  async actualizarAprendiz(idAPRENDIZ, datos) {
    return await prisma.aPRENDIZ.update({
      where: { idAPRENDIZ: Number(idAPRENDIZ) },
      data: {
        tipoDocumento: datos.tipoDocumento,
        nombre: datos.nombre,
        apellidos: datos.apellidos,
        programaId: datos.programaId
      }
    });
  },


  async cambiarEstadoAprendiz(idAPRENDIZ, estado) {
    return await prisma.aPRENDIZ.update({
      where: { idAPRENDIZ: Number(idAPRENDIZ) },
      data: {
        estado: estado
      }
    });
  },

  async listarAprendices() {
    return await prisma.aPRENDIZ.findMany({
      include: {
        programa: {
          select: {
            idPROGRAMA: true,
            nombre: true,
            nivel: true
          }
        }
      },
      orderBy: {
        nombre: "asc"
      }
    });
  },

  
  async predecirDesercionAprendiz(idAPRENDIZ) {

    const aprendiz = await prisma.aPRENDIZ.findUnique({
      where: { idAPRENDIZ: Number(idAPRENDIZ) },
      include: {
        programa: true
      }
    });

    if (!aprendiz) {
      throw new Error("Aprendiz no encontrado");
    }

    // Datos reales enviados a la IA
    const datosParaIA = {
      programaId: aprendiz.programaId,
      horas_inasistidas: aprendiz.horas_inasistidas
    };

    const resultado = await predecirDesercion(datosParaIA);

    // Guardar predicción en la base de datos
    if (resultado) {
      await prisma.pREDICCION_DESERCION.create({
        data: {
          riesgo: resultado.resultado ?? resultado,
          probabilidad: null,
          aprendizId: aprendiz.idAPRENDIZ
        }
      });
    }

    return {
      aprendiz: {
        id: aprendiz.idAPRENDIZ,
        nombre: aprendiz.nombre,
        programa: aprendiz.programa?.nombre
      },
      prediccion: resultado
    };

  },

async riesgoDesercionPorPrograma() {

  const aprendices = await prisma.aPRENDIZ.findMany({
    include: {
      programa: true
    }
  });

  const resultado = {};

  for (const aprendiz of aprendices) {

    const datosIA = {
      programaId: aprendiz.programaId,
      horas_inasistidas: aprendiz.horas_inasistidas
    };

    const prediccion = await predecirDesercion(datosIA);

    // Guardar predicción individual en la BD
    if (prediccion) {
      try {
        await prisma.pREDICCION_DESERCION.create({
          data: {
            riesgo: prediccion.resultado ?? prediccion,
            probabilidad: null,
            aprendizId: aprendiz.idAPRENDIZ
          }
        });
      } catch (e) {
        console.error(`Error guardando prediccion para aprendiz ${aprendiz.idAPRENDIZ}:`, e.message);
      }
    }

    const nombrePrograma = aprendiz.programa?.nombre || "Sin programa";

    if (!resultado[nombrePrograma]) {
      resultado[nombrePrograma] = {
        programa: nombrePrograma,
        total_aprendices: 0,
        riesgo_alto: 0
      };
    }

    resultado[nombrePrograma].total_aprendices++;

    const riesgoTexto = prediccion?.resultado ?? prediccion;
    if (riesgoTexto === "ALTO RIESGO DE DESERCIÓN") {
      resultado[nombrePrograma].riesgo_alto++;
    }

  }

  return Object.values(resultado);

}

};

module.exports = AprendizService;