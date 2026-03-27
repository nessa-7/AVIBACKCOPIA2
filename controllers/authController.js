const authService = require('../services/authService')

const authController = {
    async registeraspirante(req,res){
        try {
            const aspirantenuevo = await authService.registeraspirante(req.body)
            res.json({mensaje:"Registro realizado", aspirantenuevo})
        } catch (error) {
            const mensaje = error?.message || "Error en el registro del aspirante"
            const status = /existe|registrado|duplicados/i.test(mensaje) ? 409 : 400
            res.status(status).json({ mensaje })
        }
    },

     //REGISTRO ADMIN
    
    async registeradmin(req,res){
        try {
            const adminnuevo = await authService.registeradmin(req.body)
            res.json({ mensaje: "Admin registrado", adminnuevo })
        } catch (error) {
            const mensaje = error?.message || "Error en el registro del admin"
            const status = /existe|registrado|duplicados/i.test(mensaje) ? 409 : 400
            res.status(status).json({ mensaje })
        }
    },

    
    async loginasp(req, res){
        const result = await authService.loginaspirante(req.body)
        if(!result){
            return res.json({mensaje: "Credenciales incorrectas"})
        }
        else{
            res.json({
                mensaje: "Login exitoso",
                token: result.token,
                rol: result.rol,
                usuario: result.user
            })
        }
    },

    async loginad(req, res){
        const result = await authService.loginadmin(req.body)
        if(!result){
            return res.json({mensaje: "Credenciales incorrectas"})
        }
        else{
            res.json({
                mensaje: "Login exitoso",
                token: result.token,
                rol: result.rol,
                usuario: result.user
            })
        }
    }
}

module.exports = authController
