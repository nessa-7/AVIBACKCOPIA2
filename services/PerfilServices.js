const {PrismaClient}=require ('@prisma/client');
const prisma=new PrismaClient();

const PerfilService = {
    async traerPerfil() {
        return await prisma.aSPIRANTE.findMany(); 
    }
};

module.exports = PerfilService;
