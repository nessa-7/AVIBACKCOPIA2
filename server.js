const express = require("express")
const app = express()
const authRoutes = require("./routes/authRoutes")
const PreguntasRoutes = require("./routes/PreguntasRouter")
const RespuestaRoutes = require("./routes/RespuestaRouter")
const ProgramasRoutes = require("./routes/ProgramasRoutes")
const PerfilRoutes = require("./routes/PerfilRoutes")
const AspiranteRoutes = require("./routes/AspiranteRoutes")
const AdminRoutes = require("./routes/AdminRoutes")
const EstadisticasRoutes = require("./routes/EstadisticasRouter")

const cors = require("cors")
const bcrypt = require("bcryptjs")
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()


app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type','Authorization']
}));

app.use(express.json())
app.use('/api',authRoutes,PreguntasRoutes,RespuestaRoutes,ProgramasRoutes,PerfilRoutes,AspiranteRoutes,AdminRoutes, EstadisticasRoutes)



const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en ${PORT}`);
});
