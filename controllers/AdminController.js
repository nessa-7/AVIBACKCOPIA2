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
  },

  async actualizarPerfilAdmin(req, res) {
    try {
      const { id } = req.params;

      
      const datos = {};
      const camposPermitidos = ['nombre', 'email'];
      camposPermitidos.forEach(campo => {
        if (req.body[campo] !== undefined) {
          datos[campo] = req.body[campo];
        }
      });

      
      if (req.file) {
        const uploadStream = () => new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'admins', resource_type: 'image' },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

        const resultado = await uploadStream();
        
        
        datos.foto = resultado.secure_url;
      }

      if (Object.keys(datos).length === 0) {
        return res.status(400).json({ mensaje: "No se enviaron datos para actualizar" });
      }

      const adminActualizado = await AdminService.actualizarAdmin(id, datos);

      res.json({
        message: "Perfil actualizado correctamente",
        data: adminActualizado
      });
    } catch (error) {
      console.error("Error al actualizar perfil del admin:", error);
      res.status(500).json({ mensaje: "Error al actualizar el perfil" });
    }
  },

  async dashboardDesercion(req, res) {
    try {
      const datos = await DashboardService.desercionPorPrograma();
      res.json(datos);
    } catch (error) {
      res.status(500).json({
        message: "Error generando dashboard",
        error: error.message
      });
    }
  },

  // Endpoint especial para Power BI: retorna tabla plana (una fila por aprendiz)
  async powerbiDesercion(req, res) {
    try {
      const datos = await DashboardService.datosCompletosParaPowerBI();
      res.json(datos);
    } catch (error) {
      console.error("Error generando datos Power BI:", error);
      res.status(500).json({
        message: "Error generando datos para Power BI",
        error: error.message
      });
    }
  }
};

module.exports = AdminController;

