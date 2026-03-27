const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const bcrypt = require("bcryptjs")

const jwt = require("jsonwebtoken")

function parseFechaNacimiento(fechaNacimiento) {
    if (!fechaNacimiento) return null;

    if (fechaNacimiento instanceof Date && !Number.isNaN(fechaNacimiento.getTime())) {
        return fechaNacimiento;
    }

    const raw = String(fechaNacimiento).trim();
    if (!raw) return null;

    // yyyy-mm-dd
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(raw)) {
        const [y, m, d] = raw.split("-").map(Number);
        const dt = new Date(y, m - 1, d);
        return Number.isNaN(dt.getTime()) ? null : dt;
    }

    // dd/mm/yyyy o d/m/yyyy
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(raw)) {
        const [d, m, y] = raw.split("/").map(Number);
        const dt = new Date(y, m - 1, d);
        return Number.isNaN(dt.getTime()) ? null : dt;
    }

    // fallback
    const dt = new Date(raw);
    return Number.isNaN(dt.getTime()) ? null : dt;
}

const authService = {

    async registeraspirante(data){
        const {
            idASPIRANTE,
            nombre_completo,
            fechaNacimiento,
            email,
            telefono,
            barrio,
            direccion,
            ocupacion,
            institucion,
            password
        } = data;

        // 🔐 Validación backend importante
        if (
            (ocupacion === "Colegio" || ocupacion === "Universidad") &&
            !institucion
        ) {
            throw new Error("La institución es obligatoria si el aspirante estudia");
        }

        const fecha = parseFechaNacimiento(fechaNacimiento);
        if (!fecha) {
            throw new Error("La fecha de nacimiento no es valida");
        }

        const correoExistente = await prisma.aSPIRANTE.findFirst({
            where: { email }
        });
        if (correoExistente) {
            throw new Error("El correo ya esta registrado");
        }

        const datoencriptado = await bcrypt.hash(password, 10);

        try {
            const nuevoaspirante = await prisma.aSPIRANTE.create({
                data: {
                idASPIRANTE,
                nombre_completo,
                fechaNacimiento: fecha,
                email,
                telefono,
                barrio,
                direccion,
                ocupacion,
                institucion: institucion || null,
                password: datoencriptado
                }
            });

            return nuevoaspirante;
        } catch (error) {
            if (error?.code === "P2002") {
                const target = Array.isArray(error?.meta?.target)
                    ? error.meta.target.join(", ")
                    : String(error?.meta?.target || "");
                if (target.includes("idASPIRANTE") || target.toUpperCase().includes("PRIMARY")) {
                    throw new Error("El ID del aspirante ya existe");
                }
                if (target.includes("email")) {
                    throw new Error("El correo ya esta registrado");
                }
                throw new Error("Ya existe un registro con datos duplicados");
            }
            throw error;
        }
        },

    //REGISTRO ADMIN
    
    async registeradmin(data){
    const {idADMIN, nombre, email, password } = data; 

    const passwordEncriptado = await bcrypt.hash(password, 10);

    let nuevoAdmin;
    try {
        nuevoAdmin = await prisma.aDMIN.create({
            data: {
                idADMIN,
                nombre,
                email,
                password: passwordEncriptado
            }
        });
    } catch (error) {
        if (error?.code === "P2002") {
            const target = Array.isArray(error?.meta?.target)
                ? error.meta.target.join(", ")
                : String(error?.meta?.target || "");
            if (target.includes("idADMIN")) throw new Error("El ID del admin ya existe");
            if (target.includes("email")) throw new Error("El correo del admin ya existe");
            throw new Error("Datos duplicados del administrador");
        }
        throw error;
    }

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
                 process.env.JWT_SECRET,
                { expiresIn: "2h"}
            )
            return {user: aspirante, token, rol: "aspirante", id: aspirante.idASPIRANTE}
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
                 process.env.JWT_SECRET,
                { expiresIn: "2h"}
            )
            return {user: admin, id: admin.idADMIN, nombre: admin.nombre, token, rol: "admin"}
        }
    }

}

module.exports = authService
