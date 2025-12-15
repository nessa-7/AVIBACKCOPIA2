const authService = require('../services/authService')

const authController = {
    async registeraspirante(req,res){
        const aspirantenuevo = await authService.registeraspirante(req.body)
        res.json({mensaje:"Registro realizado", aspirantenuevo})
    },

     //REGISTRO ADMIN
    
    async registeradmin(req,res){
        const adminnuevo = await authService.registeradmin(req.body)
        res.json({ mensaje: "Admin registrado", adminnuevo })
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