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
    },

    async cambiarEstadoAspirante(idASPIRANTE, nuevoEstado) {
      return await prisma.aSPIRANTE.update({
        where: { idASPIRANTE: Number(idASPIRANTE) },
        data: { activo: nuevoEstado }
      });
    },

};

module.exports = AspiranteService;
