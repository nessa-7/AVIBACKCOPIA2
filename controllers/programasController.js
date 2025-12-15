const ProgramasService = require('../services/ProgramasService');

const ProgramasController = {

  async getProgramas(req, res) {
    const programas = await ProgramasService.traerProgramas();
    res.json(programas);
  }

};

module.exports = ProgramasController;
