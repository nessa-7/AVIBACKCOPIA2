const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const PreguntasService = {

    async  traerPreguntas() {
        return await prisma.pREGUNTAS.findMany();
    }

};
module.exports = PreguntasService;