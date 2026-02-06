const jwt = require("jsonwebtoken")

function verificarToken(req, res, next){
    const header = req.headers.authorization

    if (!header){
        return res.status(401).json({ mensaje: "Token no enviado" })
    }

    const token = header.split(" ")[1]

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err){
            return res.status(401).json({ mensaje: "Token inválido" })
        }

        req.user = decoded // { id, rol, ... }
        next()
    })
}

module.exports = verificarToken

