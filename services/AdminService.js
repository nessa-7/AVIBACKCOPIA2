const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const AdminService = {
  async traerAdmins() {
    return await prisma.aDMIN.findMany();
  },

  async actualizarAdmin(idADMIN, datosActualizados) {
    return await prisma.aDMIN.update({
      where: { idADMIN: Number(idADMIN) },
      data: datosActualizados
    });
  },

  async cambiarEstadoAdmin(idADMIN, nuevoEstado) {
    return await prisma.aDMIN.update({
      where: { idADMIN: Number(idADMIN) },
      data: { activo: nuevoEstado }
    });
  }
};

module.exports = AdminService;
