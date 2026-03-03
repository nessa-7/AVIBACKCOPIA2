const PerfilService = require("../services/PerfilServices")

const PerfilController = {

    async obtenerPerfil(req, res) {
            try {
                const idAspirante = req.user.id;
                const perfil = await PerfilService.traerPerfil(idAspirante);
                if (!perfil) {
                    return res.status(404).json({ mensaje: "Usuario no encontrado" });
                }
                res.json(perfil);
            } catch (error) {
                console.error("Error al obtener perfil del aspirante:", error);
                res.status(500).json({ mensaje: "Error al obtener el perfil" });
            }
        },
    
        
        async actualizarPerfil(req, res) {
            try {
                const idAspirante = req.user.id;
    
                
                const datos = {};
                const camposPermitidos = [
                    'nombre_completo', 'email', 'telefono',
                    'barrio', 'direccion', 'ocupacion', 'institucion', 'foto'
                ];
                camposPermitidos.forEach(campo => {
                    if (req.body[campo] !== undefined) {
                        datos[campo] = req.body[campo];
                    }
                });
    
                
                if (req.file) {
                    const uploadStream = () => new Promise((resolve, reject) => {
                        const stream = cloudinary.uploader.upload_stream(
                            { folder: 'aspirantes', resource_type: 'image' },
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
    
                const perfilActualizado = await PerfilService.actualizarPerfil(idAspirante, datos);
    
                res.json({
                    message: "Perfil actualizado correctamente",
                    data: perfilActualizado
                });
            } catch (error) {
                console.error("Error al actualizar perfil del aspirante:", error);
                res.status(500).json({ mensaje: "Error al actualizar el perfil" });
            }
        }
}

module.exports = PerfilController 
