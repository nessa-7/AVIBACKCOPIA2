const IA_Prediccion = process.env.IA_Prediccion || "http://localhost:8000";

const predecirDesercion = async (aprendiz) => {
  try {
    const response = await fetch(IA_Prediccion, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        programaId: aprendiz.programaId,
        horas_inasistidas: aprendiz.horas_inasistidas
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    console.error("Error IA:", error.message);
    return null;
  }
};

module.exports = predecirDesercion
