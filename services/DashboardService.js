const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const DashboardService = {

  async desercionPorPrograma() {

    const datos = await prisma.pROGRAMA.findMany({
      include: {
        aprendices: {
          include: {
            predicciones: true
          }
        }
      }
    });

    const resultado = datos.map(programa => {

      let alto = 0;
      let medio = 0;
      let bajo = 0;

      programa.aprendices.forEach(a => {

        const ultima = a.predicciones[a.predicciones.length - 1];

        if (!ultima) return;

        if (ultima.riesgo === "ALTO") alto++;
        if (ultima.riesgo === "MEDIO") medio++;
        if (ultima.riesgo === "BAJO") bajo++;

      });

      return {
        programa: programa.nombre,
        total_aprendices: programa.aprendices.length,
        riesgo_alto: alto,
        riesgo_medio: medio,
        riesgo_bajo: bajo
      };

    });

    return resultado;

  },

  // Endpoint plano para Power BI: una fila por aprendiz con todos los campos necesarios
  async datosCompletosParaPowerBI() {

    const aprendices = await prisma.aPRENDIZ.findMany({
      include: {
        programa: true,
        predicciones: {
          orderBy: { fecha: "desc" },
          take: 1
        }
      }
    });

    const filas = aprendices.map(a => {
      const prediccion = a.predicciones[0] || null;
      return {
        id_aprendiz:        a.idAPRENDIZ,
        nombre:             `${a.nombre} ${a.apellidos}`,
        tipo_documento:     a.tipoDocumento,
        programa:           a.programa.nombre,
        nivel:              a.programa.nivel,
        estado:             a.estado ? "Activo" : "Inactivo",
        horas_inasistidas:  a.horas_inasistidas,
        riesgo:             prediccion ? prediccion.riesgo        : "SIN PREDICCION",
        probabilidad:       prediccion ? prediccion.probabilidad  : null,
        fecha_prediccion:   prediccion ? prediccion.fecha         : null
      };
    });

    return filas;

  }

};

module.exports = DashboardService;