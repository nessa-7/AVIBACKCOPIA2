const CentroService = require("../services/CentroService");

const CentrosController = {

  async getCentros(req, res) {
    const centros = await CentroService.traerCentros();
    res.json(centros);
  }

};

module.exports = CentrosController;
