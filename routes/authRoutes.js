const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const verificarToken = require("../middleware/authMiddleware")

router.post('/registeraspirante', authController.registeraspirante)
router.post('/loginaspirante', authController.loginasp)
router.post('/loginadmin', authController.loginad)

router.get('/perfil', verificarToken, async (req , res) => {
    res.json({
        mensaje: "Acceso Permitido",
        usuario: req.user
    })
})

router.post('/registroadmin', authController.registeradmin)

module.exports = router