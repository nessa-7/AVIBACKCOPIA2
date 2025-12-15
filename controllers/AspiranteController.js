const AspiranteService = require('../services/AspiranteService');

const AspiranteController = {
    async getAspirantes(req, res) {
        const aspirantes = await AspiranteService.traerAspirantes();
        res.json(aspirantes);
    },
    async deleteAspirante(req, res){
        const id = req.params.id;
        await AspiranteService.eliminarAspirante(id);
        res.json({ message: 'Aspirante eliminado' });
    },

    async actualizar(req, res) {
    
      const { id } = req.params;
      const datos = req.body; // Campos a actualizar

      const aspiranteActualizado = await AspiranteService.actualizarAspirante(id, datos);

      res.json({
        message: "Aspirante actualizado correctamente",
        data: aspiranteActualizado
      });
    }
}
module.exports = AspiranteController;

