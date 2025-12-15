const jwt = require("jsonwebtoken")

function verificarToken(req, res, next){
    const header = req.headers['authorization']
    if (!header){
        return res.json({ mensaje: "Token no enviado"})
    }
    const token = header.split(" ")[1] //Bearer token
    jwt.verify(token, "JWT_SECRET", (err, decoded) => {
        if(err){
            return res.json({ mensaje: "Token invalido"})
        }
        req.user = decoded //Guarda los datos del usuario

        next()
    })
}

module.exports = verificarToken