const RespuestasService=require ('../services/RespuestaService');

const RespuestaControllers ={

    async createRespuesta(req,res){
        const nueva=req.body;
        const nuevarespuesta= await RespuestasService.createRespuesta(nueva);
        res.json({mensaje:"nueva respuesta creada",nuevarespuesta})

    }
};
module.exports = RespuestaControllers;