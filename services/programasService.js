const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const ProgramasService = {
  async traerProgramas() {
    return await prisma.PROGRAMA.findMany();
  }
};

module.exports = ProgramasService;
