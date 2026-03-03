const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const PerfilService = {
    traerPerfil(idAspirante) {
        return prisma.aSPIRANTE.findUnique({
            where: {
                idASPIRANTE: idAspirante
            },
            select: {
                idASPIRANTE: true,
                nombre_completo: true,
                email: true,
                telefono: true,
                barrio: true,
                direccion: true,
                ocupacion: true,
                institucion: true,
                foto: true
            }
        })
    },

    async actualizarPerfil(idASPIRANTE, datos) {
        return await prisma.aSPIRANTE.update({
            where: { idASPIRANTE: Number(idASPIRANTE) },
            data: datos
        });
    }
}

module.exports = PerfilService
