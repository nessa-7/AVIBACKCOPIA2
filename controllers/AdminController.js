const AdminService = require('../services/AdminService');

const AdminController = {
    async getAdmin(req, res) {
        const admin = await AdminService.traerAspirantes();
        res.json(admin);
    },
    async deleteAdmin(req, res){
        const id = req.params.id;
        await AdminService.eliminarAspirante(id);
        res.json({ message: 'Admin eliminado' });
    },  
    async actualizarAdmin(req, res) {
    
      const { id } = req.params;
      const datos = req.body; // Campos a actualizar
        const adminActualizado = await AdminService.actualizarAspirante(id, datos);
        res.json({
            message: "Admin actualizado correctamente",
            data: adminActualizado
        });
    }
};

module.exports = AdminController;

