const RespuestaControllers=require('../controllers/RespuestasController');
const express =require ('express');
const router= express.Router();

router.post ('/respuestas', RespuestaControllers.createRespuesta); 

module.exports = router