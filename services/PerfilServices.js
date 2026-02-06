const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const PerfilService = {
    traerPerfil(idAspirante){
        return prisma.aSPIRANTE.findUnique({
            where: {
                idASPIRANTE: idAspirante
            },
            select: {
                idASPIRANTE: true,
                nombre_completo: true,
                email: true,
                telefono: true
            }
        })
    }
}

module.exports = PerfilService
