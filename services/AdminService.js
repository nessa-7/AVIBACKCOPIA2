const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const AdminService = {
  async traerAspirantes() {
    return await prisma.aDMIN.findMany();
  },

  async eliminarAspirante(idADMIN) {
        return await prisma.aDMIN.delete({
            where: {idADMIN: Number(idADMIN)}
        });
    },

    async actualizarAspirante(idADMIN, datosActualizados) {
    return await prisma.aDMIN.update({
      where: { idADMIN: Number(idADMIN) },
      data: datosActualizados
    });
  }
};

module.exports = AdminService;
