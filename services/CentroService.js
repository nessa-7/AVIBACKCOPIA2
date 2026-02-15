const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const CentroService = {

  async traerCentros() {
    return await prisma.cENTRO.findMany();
  }

};

module.exports = CentroService;
