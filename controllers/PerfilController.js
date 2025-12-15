const PerfilService = require('../services/PerfilServices');

const PerfilController = {
    async getPerfilAspirante(req, res) {
        const perfil = await PerfilService.traerPerfil();
        res.json(perfil);
    }
};

module.exports = PerfilController;
