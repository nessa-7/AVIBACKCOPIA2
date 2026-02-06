const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const ProgramaService = {
  async traerProgramas() {
    return await prisma.PROGRAMA.findMany();
  }
};

module.exports = ProgramaService;
