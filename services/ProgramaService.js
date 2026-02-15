const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const ProgramaService = {
  async traerProgramas() {
    return await prisma.pROGRAMA.findMany();
  },


  async crearPrograma(data) {
  return await prisma.pROGRAMA.create({
    data: {
      nombre: data.nombre,
      nivel: data.nivel,
      descripcion: data.descripcion,
      centroId: data.centroId
      }
    });
  },


  async cambiarEstado(id, activo) {
    return await prisma.pROGRAMA.update({
      where: {
        idPROGRAMA: Number(id)
      },
      data: {
        activo
      }
    });
  }
};

module.exports = ProgramaService;
