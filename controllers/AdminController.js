const AdminService = require('../services/AdminService');

const AdminController = {
    async getAdmin(req, res) {
    const admin = await AdminService.traerAdmins();
    res.json(admin);
  },

  async actualizarAdmin(req, res) {
    const { id } = req.params;
    const datos = req.body;
    const adminActualizado = await AdminService.actualizarAdmin(id, datos);
    res.json({
      message: "Admin actualizado correctamente",
      data: adminActualizado
    });
  },

  async cambiarEstadoAdmin(req, res) {
    const { id } = req.params;
    const { activo } = req.body;
    const adminActualizado = await AdminService.cambiarEstadoAdmin(id, activo);
    res.json({
      message: "Estado del admin actualizado correctamente",
      data: adminActualizado
    });
  }
};

module.exports = AdminController;

