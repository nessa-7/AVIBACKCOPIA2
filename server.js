const express = require("express")
const app = express()
const authRoutes = require("./routes/authRoutes")
const PreguntasRoutes = require("./routes/PreguntasRouter")
const RespuestaRoutes = require("./routes/RespuestaRouter")
const ProgramasRoutes = require("./routes/programasRoutes")
const PerfilRoutes = require("./routes/PerfilRoutes")
const AspiranteRoutes = require("./routes/AspiranteRoutes")
const AdminRoutes = require("./routes/AdminRoutes")

const cors = require("cors")
const bcrypt = require("bcryptjs")
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()


app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type','Authorization']
}));

app.use(express.json())
app.use('/api',authRoutes,PreguntasRoutes,RespuestaRoutes,ProgramasRoutes,PerfilRoutes,AspiranteRoutes,AdminRoutes)


app.listen(4000, () => {
    console.log('Servidor ejecutando puerto 4000')
})