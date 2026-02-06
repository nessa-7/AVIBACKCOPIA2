const PerfilService = require("../services/PerfilServices")

const PerfilController = {

    async obtenerPerfil(req, res){
        const idAspirante = req.user.id

        PerfilService.traerPerfil(idAspirante)
            .then(perfil => {
                if (!perfil){
                    return res.status(404).json({ mensaje: "Usuario no encontrado" })
                }

                res.json(perfil)
            })

    }
}

module.exports = PerfilController 
