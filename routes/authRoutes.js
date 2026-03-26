const express          = require("express")
const router           = express.Router()
const authController   = require("../controllers/authController")
const verificarToken   = require("../middleware/authMiddleware")

// ── REGISTRO ASPIRANTE CON VERIFICACIÓN OTP (2 pasos) ────────────────────────
router.post('/pre-registro',     authController.preRegistroAspirante)  // Paso 1: envía código
router.post('/verificar-codigo', authController.verificarCodigo)        // Paso 2: valida y crea cuenta
router.post('/reenviar-codigo',  authController.reenviarCodigo)         // Opcional: reenviar

// ── REGISTRO DIRECTO (legacy) ─────────────────────────────────────────────────
router.post('/registeraspirante', authController.registeraspirante)

// ── LOGIN ─────────────────────────────────────────────────────────────────────
router.post('/loginaspirante', authController.loginasp)
router.post('/loginadmin',     authController.loginad)

// ── PERFIL PROTEGIDO ──────────────────────────────────────────────────────────
router.get('/perfil', verificarToken, (req, res) => {
    res.json({ mensaje: "Acceso Permitido", usuario: req.user })
})

// ── REGISTRO ADMIN ────────────────────────────────────────────────────────────
router.post('/registroadmin', authController.registeradmin)

module.exports = router