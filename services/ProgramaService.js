const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const ProgramaService = {
  async traerProgramas() {
    return await prisma.pROGRAMA.findMany({
      include: {
      centro: true
    }
    });
  },


  async crearPrograma(data) {
    const rawAr = data.AR ?? data.ar ?? data.url ?? "";
    const ar = typeof rawAr === "string" ? rawAr.trim() : "";
    const rawModalidad = data.modalidad ?? data.Modalidad ?? data.mode ?? "";
    const modalidad = typeof rawModalidad === "string" ? rawModalidad.trim() : "";

    return await prisma.pROGRAMA.create({
      data: {
        nombre: data.nombre,
        nivel: data.nivel,
        descripcion: data.descripcion,
        modalidad: modalidad || null,
        AR: ar || null,
        centroId: data.centroId,
        activo: data.activo !== undefined ? data.activo : true
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
  },

   async editarPrograma(id, data) { 
    return await prisma.pROGRAMA.update({
      where: { idPROGRAMA: Number(id) },
      data: {
        nombre: data.nombre,
        nivel: data.nivel,
        descripcion: data.descripcion,
        modalidad: data.modalidad?.trim() || null,
        AR: data.AR?.trim() || null,
        centroId: data.centroId,
        activo: data.activo ?? true
      }
    });
  }
};

module.exports = ProgramaService;
