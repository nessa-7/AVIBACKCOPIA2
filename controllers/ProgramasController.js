const ProgramasService = require('../services/ProgramaService');

const ProgramasController = {

  async getProgramas(req, res) {
    const programas = await ProgramasService.traerProgramas();
    res.json(programas);
  }

};

module.exports = ProgramasController;
