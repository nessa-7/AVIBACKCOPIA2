const ProgramasService = require('../services/ProgramaService');

const ProgramasController = {

  async getProgramas(req, res) {
    const programas = await ProgramasService.traerProgramas();
    res.json(programas);
  },

  async crearPrograma(req, res) {
    const programa = await ProgramasService.crearPrograma(req.body);
    res.json(programa);
  },

  async cambiarEstado(req, res) {
    const { id } = req.params;
    const { activo } = req.body;

    const programa = await ProgramasService.cambiarEstado(id, activo);
    res.json(programa);
  }

};

module.exports = ProgramasController;
