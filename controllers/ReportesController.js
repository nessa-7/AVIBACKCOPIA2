const ReportesService = require("../services/ReportesService");

const ReportesController = {

    async misReportes(req, res) {
    try {

        if (req.user.rol !== "aspirante") {
        return res.status(403).json({ error: "No autorizado" });
        }

        const aspiranteId = req.user.id;

        const reportes =
        await ReportesService.obtenerReportesPorAspirante(aspiranteId);

        res.json(reportes);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error obteniendo reportes" });
    }
    },

    async todosReportes(req, res) {
    try {

        if (req.user.rol !== "admin") {
        return res.status(403).json({ error: "No autorizado" });
        }

        const reportes =
        await ReportesService.obtenerTodosLosReportes();

        res.json(reportes);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error obteniendo reportes" });
    }
    }

};

module.exports = ReportesController;