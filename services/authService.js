const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const bcrypt = require("bcryptjs")

const jwt = require("jsonwebtoken")

const authService = {

    async registeraspirante(data){
        const {idASPIRANTE,nombre_completo,email,telefono,password}=data

        //encriptar password
        const datoencriptado = await bcrypt.hash(password,10)
        const nuevoaspirante = await prisma.aSPIRANTE.create({data:
            {idASPIRANTE,nombre_completo,email,telefono,password:datoencriptado}
        })

        return nuevoaspirante
    },

    //REGISTRO ADMIN
    
    async registeradmin(data){
    const {idADMIN, nombre, email, password } = data; 

    const passwordEncriptado = await bcrypt.hash(password, 10);

    const nuevoAdmin = await prisma.aDMIN.create({
        data: {
            idADMIN,
            nombre,
            email,
            password: passwordEncriptado
        }
    });

    return nuevoAdmin;
},

    
    async loginaspirante(data){

        const {id, pass} = data

        //buscar aspirante
        const aspirante = await prisma.aSPIRANTE.findUnique({ where: { idASPIRANTE: id }})
        if (aspirante){
            const valido = await bcrypt.compare(pass, aspirante.password)
            if (!valido){
                return null
            }
            const token = jwt.sign(
                { id: aspirante.idASPIRANTE, nombre_completo: aspirante.nombre_completo, rol: "aspirante"},
                "JWT_SECRET",
                { expiresIn: "2h"}
            )
            return {user: aspirante, token, rol: "aspirante"}
        }

        return null
    },

    async loginadmin(data){
            const {id, pass} = data

        //buscar admin
        const admin = await prisma.aDMIN.findUnique({ where: {idADMIN: id}})

        if (admin){

            const valido = await bcrypt.compare(pass, admin.password)
            if (!valido){
                return null
            }
            const token = jwt.sign(
                { id: admin.idADMIN, rol: "admin"},
                "JWT_SECRET",
                { expiresIn: "2h"}
            )
            return {user: admin, token, rol: "admin"}
        }
    }

}

module.exports = authService