const {PrismaClient}=require ('@prisma/client');
const prisma=new PrismaClient();

const RespuestasService={
    async  createRespuesta(data){
        return await prisma.rESPUESTAS.create({data});
    },
}

module.exports=RespuestasService;