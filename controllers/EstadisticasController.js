const EstadisticasService = require('../services/EstadisticasService')

const EstadisticasController = {

    async getTestsRealizados(req, res) {
        const estadisticas = await EstadisticasService.testsRealizados()

        res.json({
            data: estadisticas
        })
    },


    getTestsPorMes: async (req, res) => {
         
        const { year } = req.query

            const data = await EstadisticasService.testsPorMesYear(year)

            res.json({
                data
            })
    },


    async getProgramasMasRecomendados(req, res) {
        const limit = Number(req.query.limit) || 5;
        const meses = req.query.meses ? Number(req.query.meses) : null;

        const data = await EstadisticasService.programasMasRecomendados(limit, meses);

        res.json({ data });
    },



    async getProgramaMes(req, res) {
        const programaId = Number(req.query.programaId)
        const year = Number(req.query.year)

        const meses = await EstadisticasService.ProgramaMes(
            programaId,
            year
        )

        res.json({
            data: { meses }
        })
    },


    async getProgramas(req, res) {
        const programas = await EstadisticasService.listarProgramas()

        res.json({
            data: programas
        })
        
    },


    async getTotalAspirantes(req, res) {
        const total = await EstadisticasService.totalAspirantes();
        res.json(total);
    },

    async getReportesCompletados(req, res) {
        const total = await EstadisticasService.reportesCompletados();
        res.json(total);
    },


    async getTestsCompletadosPorAspirante(req, res) {

        const { id } = req.params;

        const total = await EstadisticasService.testsCompletadosPorAspirante(id);

        res.json(total);

    },


    async getAspirantesPorProgramaNivel(req, res) {
    const datos = await EstadisticasService.aspirantesPorProgramaNivel();
    res.json(datos);
    }


}

module.exports = EstadisticasController
