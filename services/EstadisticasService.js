const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const EstadisticasService = {

    async testsRealizados() {

    // Hoy
    const inicioDia = new Date()
    inicioDia.setHours(0, 0, 0, 0)

    // Semana (lunes)
    const inicioSemana = new Date()
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay())
    inicioSemana.setHours(0, 0, 0, 0)

    // Mes
    const inicioMes = new Date()
    inicioMes.setDate(1)
    inicioMes.setHours(0, 0, 0, 0)

    const [hoy, semana, mes] = await Promise.all([
      prisma.rEPORTE.count({
        where: { Fecha: { gte: inicioDia } }
      }),
      prisma.rEPORTE.count({
        where: { Fecha: { gte: inicioSemana } }
      }),
      prisma.rEPORTE.count({
        where: { Fecha: { gte: inicioMes } }
      })
    ])

    return { hoy, semana, mes }
  },


  async testsPorMesYear(year) {

    const selectedYear = Number(year) || new Date().getFullYear()

    const inicioYear = new Date(selectedYear, 0, 1)   // 1 enero
    const finYear = new Date(selectedYear + 1, 0, 1)  // 1 enero año siguiente

    const reportes = await prisma.rEPORTE.findMany({
        where: {
        Fecha: {
            gte: inicioYear,
            lt: finYear
        }
        },
        select: {
        Fecha: true
        }
    })

    const meses = Array(12).fill(0)

    reportes.forEach(r => {
        const mes = new Date(r.Fecha).getMonth() // 0–11
        meses[mes]++
    })

        return {
            year: selectedYear,
            meses
        }
    },



    async programasMasRecomendados(limit = 5, meses = null) {

        let where = {};

        if (meses) {
            const fechaInicio = new Date();
            fechaInicio.setMonth(fechaInicio.getMonth() - meses);

            where = {
            reporte: {
                Fecha: {
                gte: fechaInicio
                }
            }
            };
        }

        const resultados = await prisma.rECOMENDACION.groupBy({
            by: ['programaId'],
            _count: {
            programaId: true
            },
            where,
            orderBy: {
            _count: {
                programaId: 'desc'
            }
            },
            take: limit
        });

        const programas = await prisma.pROGRAMA.findMany({
            where: {
            idPROGRAMA: {
                in: resultados.map(r => r.programaId)
            }
            },
            select: {
            idPROGRAMA: true,
            nombre: true
            }
        });

        return resultados.map(r => {
            const programa = programas.find(p => p.idPROGRAMA === r.programaId);
            return {
            programa: programa?.nombre || 'Desconocido',
            total: r._count.programaId
            };
        });
        },


    async ProgramaMes(programaId, year) {

        const selectedYear = Number(year);
        const progId = Number(programaId);

        if (!selectedYear || !progId) {
            return Array(12).fill(0);
        }

        const inicioYear = new Date(selectedYear, 0, 1);
        const finYear = new Date(selectedYear + 1, 0, 1);

        const reportes = await prisma.rEPORTE.findMany({
            where: {
            recomendaciones: {
                some: {
                programaId: progId   
                }
            },
            Fecha: {
                gte: inicioYear,
                lt: finYear
            }
            },
            select: {
            Fecha: true
            }
        });

        const meses = Array(12).fill(0);

        reportes.forEach(r => {
            const mes = new Date(r.Fecha).getMonth();
            meses[mes]++;
        });

        return meses;
        },


    async listarProgramas() {
        return await prisma.pROGRAMA.findMany({
            select: {
            idPROGRAMA: true,
            nombre: true
            },
            orderBy: {
            nombre: 'asc'
            }
        })

    }



}

module.exports = EstadisticasService