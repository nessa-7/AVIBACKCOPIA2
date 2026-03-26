const AdminService    = require('../services/AdminService');
const DashboardService = require('../services/DashboardService');
const AprendizService  = require('../services/AprendizService');
const FabricService    = require('../services/FabricService');
const PowerBIService   = require('../services/PowerBIService');
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const AdminController = {

  async getAdmin(req, res) {
    const admin = await AdminService.traerAdmins();
    res.json(admin);
  },

  async actualizarAdmin(req, res) {
    const { id } = req.params;
    const datos = req.body;
    const adminActualizado = await AdminService.actualizarAdmin(id, datos);
    res.json({
      message: "Admin actualizado correctamente",
      data: adminActualizado
    });
  },

  async cambiarEstadoAdmin(req, res) {
    const { id } = req.params;
    const { activo } = req.body;
    const adminActualizado = await AdminService.cambiarEstadoAdmin(id, activo);
    res.json({
      message: "Estado del admin actualizado correctamente",
      data: adminActualizado
    });
  },

  async actualizarPerfilAdmin(req, res) {
    try {
      const { id } = req.params;
      const datos = {};
      const camposPermitidos = ['nombre', 'email'];
      camposPermitidos.forEach(campo => {
        if (req.body[campo] !== undefined) {
          datos[campo] = req.body[campo];
        }
      });

      if (req.file) {
        try {
          const cloudinary = require('../middleware/cloudinaryConfig');
          const streamifier = require('streamifier');
          const uploadStream = () => new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: 'admins', resource_type: 'image' },
              (error, result) => {
                if (error) return reject(error);
                resolve(result);
              }
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
          });
          const resultado = await uploadStream();
          datos.foto = resultado.secure_url;
        } catch (err) {
          console.error('Error subiendo imagen:', err.message);
        }
      }

      if (Object.keys(datos).length === 0) {
        return res.status(400).json({ mensaje: "No se enviaron datos para actualizar" });
      }

      const adminActualizado = await AdminService.actualizarAdmin(id, datos);
      res.json({ message: "Perfil actualizado correctamente", data: adminActualizado });
    } catch (error) {
      console.error("Error al actualizar perfil del admin:", error);
      res.status(500).json({ mensaje: "Error al actualizar el perfil" });
    }
  },

  async dashboardDesercion(req, res) {
    try {
      const datos = await DashboardService.desercionPorPrograma();
      res.json(datos);
    } catch (error) {
      res.status(500).json({ message: "Error generando dashboard", error: error.message });
    }
  },

  // ── Endpoint especial para Power BI: tabla plana una fila por aprendiz ────
  async powerbiDesercion(req, res) {
    try {
      const datos = await DashboardService.datosCompletosParaPowerBI();
      res.json(datos);
    } catch (error) {
      console.error("Error generando datos Power BI:", error);
      res.status(500).json({ message: "Error generando datos para Power BI", error: error.message });
    }
  },

  // ── Retorna última predicción por programa (para Power BI Demanda) ─────────
  async powerbiDemandaProgramas(req, res) {
    try {
      const filas = await FabricService.obtenerUltimaPrediccionPorPrograma();
      const resultado = filas.map((p, index) => ({
        id:                p.id,
        programa:          p.programa,
        nivel:             p.nivel,
        demanda:           p.demanda,
        tendencia:         p.tendencia,
        confianza:         p.confianza,
        trimestre_objetivo: p.trimestre,
        accion_sugerida:   p.accion,
        fecha:             p.fecha,
        ranking:           index + 1,
      }));
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ message: "Error obteniendo datos para Power BI", error: error.message });
    }
  },

  // ── Calcula demanda por programa usando la IA legacy (/predict-demanda) ────
  async calcularDemanda() {
    const IA_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';
    const programas = await prisma.pROGRAMA.findMany({
      include: { aprendices: true, recomendaciones: { include: { reporte: true } } }
    });

    const resultado = [];
    for (const programa of programas) {
      const aprendices = programa.aprendices.length;
      const reportes   = programa.recomendaciones.map(r => r.reporte).filter(Boolean);
      const aspirantes = reportes.length;

      let demandaPredicha = 0;
      if (aspirantes > 0) {
        const n = aspirantes;
        const promedio = {
          R: reportes.reduce((s, r) => s + (r.puntajeR || 0), 0) / n,
          I: reportes.reduce((s, r) => s + (r.puntajeI || 0), 0) / n,
          A: reportes.reduce((s, r) => s + (r.puntajeA || 0), 0) / n,
          S: reportes.reduce((s, r) => s + (r.puntajeS || 0), 0) / n,
          E: reportes.reduce((s, r) => s + (r.puntajeE || 0), 0) / n,
          C: reportes.reduce((s, r) => s + (r.puntajeC || 0), 0) / n,
        };
        try {
          const respuesta = await fetch(`${IA_URL}/predict-demanda`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ programaId: programa.idPROGRAMA, ...promedio, aprendices_actuales: aprendices })
          });
          const data = await respuesta.json();
          demandaPredicha = data.demanda_predicha || 0;
        } catch (error) {
          console.log("Error llamando IA:", error.message);
        }
      }

      resultado.push({ programa: programa.nombre, nivel: programa.nivel, aspirantes, aprendices, demanda_predicha: demandaPredicha });
    }

    resultado.sort((a, b) => b.demanda_predicha - a.demanda_predicha);
    resultado.forEach((p, index) => { p.ranking = index + 1; });
    return resultado;
  },

  async demandaProgramas(req, res) {
    try {
      const resultado = await AdminController.calcularDemanda();
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ message: "Error obteniendo demanda", error: error.message });
    }
  },

  // ── Carga masiva de aprendices desde JSON array ────────────────────────────
  async uploadAprendices(req, res) {
    try {
      const aprendices = req.body;
      if (!Array.isArray(aprendices)) {
        return res.status(400).json({ message: "Se esperaba un arreglo de aprendices" });
      }
      const total = await AprendizService.crearAprendicesMasivo(aprendices);
      res.status(201).json({ message: "Aprendices cargados correctamente", total });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al registrar aprendices", error: error.message });
    }
  }

};

module.exports = AdminController;
