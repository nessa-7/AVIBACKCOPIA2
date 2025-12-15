const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const AspiranteService = {
  async traerAspirantes() {
    return await prisma.aSPIRANTE.findMany();
  },

  async eliminarAspirante(idASPIRANTE) {
        return await prisma.aSPIRANTE.delete({
            where: {idASPIRANTE: Number(idASPIRANTE)}
        });
    },

    async actualizarAspirante(idASPIRANTE, datosActualizados) {
    return await prisma.aSPIRANTE.update({
      where: { idASPIRANTE: Number(idASPIRANTE) },
      data: datosActualizados
    });
  }
};

module.exports = AspiranteService;
