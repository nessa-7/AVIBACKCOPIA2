const axios = require("axios");

const IA_Prediccion = process.env.IA_Prediccion || "http://localhost:8000";

const predecirDesercion = async (aprendiz) => {
  try {

    const response = await axios.post(IA_URL, {
      programaId: aprendiz.programaId,
      horas_inasistidas: aprendiz.horas_inasistidas
    });

    return response.data;

  } catch (error) {
    console.error("Error IA:", error.message);
    return null;
  }
};

module.exports = {
  predecirDesercion
};