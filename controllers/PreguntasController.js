const PreguntasService = require('../services/PreguntasService');

const PreguntasController = {
    async getPreguntas(req, res) {
        const preguntas = await PreguntasService.traerPreguntas();
        res.json(preguntas);
    }
};

module.exports = PreguntasController;