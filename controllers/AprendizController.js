const AprendizService = require("../services/AprendizService");

const AprendizController = {

  //CREAR
  async crearAprendiz(req, res) {
    try {
      const aprendiz = await AprendizService.crearAprendizDesdeAdmin(req.body);
      res.status(201).json({
        message: "Aprendiz registrado correctamente",
        aprendiz
      });
    } catch (error) {
      res.status(400).json({
        message: "Error al registrar aprendiz",
        error: error.message
      });
    }
  },

  //ACTUALIZAR
  async actualizarAprendiz(req, res) {
    try {
      const { id } = req.params;
      const aprendiz = await AprendizService.actualizarAprendiz(id, req.body);
      res.json({
        message: "Aprendiz actualizado correctamente",
        aprendiz
      });
    } catch (error) {
      res.status(400).json({
        message: "Error al actualizar aprendiz",
        error: error.message
      });
    }
  },

  //CAMBIAR ESTADO
  async cambiarEstadoAprendiz(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      const aprendiz = await AprendizService.cambiarEstadoAprendiz(id, estado);

      res.json({
        message: "Estado del aprendiz actualizado",
        aprendiz
      });

    } catch (error) {
      res.status(400).json({
        message: "Error al cambiar estado del aprendiz",
        error: error.message
      });
    }
  },

  // LISTAR
  async listarAprendices(req, res) {
    try {
      const aprendices = await AprendizService.listarAprendices();
      res.json(aprendices);
    } catch (error) {
      res.status(500).json({
        message: "Error al listar aprendices",
        error: error.message
      });
    }
  },

  //PREDICCIÓN IA
  async predecirDesercion(req, res) {
    try {

      const { id } = req.params;

      const resultado = await AprendizService.predecirDesercionAprendiz(id);

      res.json({
        message: "Predicción realizada correctamente",
        resultado
      });

    } catch (error) {
      res.status(500).json({
        message: "Error al predecir deserción",
        error: error.message
      });
    }
  },
  // RIESGO DE DESERCIÓN POR PROGRAMA
async riesgoDesercionProgramas(req, res) {
  try {

    const resultado = await AprendizService.riesgoDesercionPorPrograma();

    res.json({
      message: "Análisis de deserción por programa",
      programas: resultado
    });

  } catch (error) {
    res.status(500).json({
      message: "Error al analizar deserción",
      error: error.message
    });
  }
},

  // LISTAR PREDICCIONES GUARDADAS
  async listarPredicciones(req, res) {
    try {
      const { PrismaClient } = require("@prisma/client");
      const prisma = new PrismaClient();
      const predicciones = await prisma.pREDICCION_DESERCION.findMany({
        orderBy: { fecha: "desc" },
        include: {
          aprendiz: {
            select: {
              nombre: true,
              apellidos: true,
              programa: {
                select: { nombre: true, nivel: true }
              }
            }
          }
        }
      });
      res.json(predicciones);
    } catch (error) {
      res.status(500).json({
        message: "Error al listar predicciones",
        error: error.message
      });
    }
  }

};

module.exports = AprendizController;