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

    async actualizarAspirante(req, res) {
    const { id } = req.params;
    const datos = req.body;
    const aspiranteActualizado = await AspiranteService.actualizarAspirante(id, datos);
    res.json({
      message: "Aspirante actualizado correctamente",
      data: aspiranteActualizado
    });
  },

  async cambiarEstadoAspirante(req, res) {
    const { id } = req.params;
    const { activo } = req.body;
    const aspiranteActualizado = await AspiranteService.cambiarEstadoAspirante(id, activo);
    res.json({
      message: "Estado del aspirante actualizado correctamente",
      data: aspiranteActualizado
    });
  }

  
}
module.exports = AspiranteController;

