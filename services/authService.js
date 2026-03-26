const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const bcrypt = require("bcryptjs")
const jwt    = require("jsonwebtoken")

const { enviarCodigoVerificacion } = require("./EmailService")

/** Genera un código numérico de 6 dígitos */
function generarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function parseFechaNacimiento(fechaNacimiento) {
    if (!fechaNacimiento) return null;
    if (fechaNacimiento instanceof Date && !Number.isNaN(fechaNacimiento.getTime())) {
        return fechaNacimiento;
    }
    const raw = String(fechaNacimiento).trim();
    if (!raw) return null;
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(raw)) {
        const [y, m, d] = raw.split("-").map(Number);
        const dt = new Date(y, m - 1, d);
        return Number.isNaN(dt.getTime()) ? null : dt;
    }
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(raw)) {
        const [d, m, y] = raw.split("/").map(Number);
        const dt = new Date(y, m - 1, d);
        return Number.isNaN(dt.getTime()) ? null : dt;
    }
    const dt = new Date(raw);
    return Number.isNaN(dt.getTime()) ? null : dt;
}

const authService = {

  // ────────────────────────────────────────────────────────────────
  //  PRE-REGISTRO: guarda datos temporalmente y envía código por email
  // ────────────────────────────────────────────────────────────────
  async preRegistroAspirante(data) {
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
      password,
    } = data;

    // Validación: institución obligatoria si estudia
    if (
      (ocupacion === "Colegio" || ocupacion === "Universidad") &&
      !institucion
    ) {
      throw new Error("La institución es obligatoria si el aspirante estudia");
    }

    // Verificar que el aspirante no exista ya en la BD
    const existe = await prisma.aSPIRANTE.findUnique({
      where: { idASPIRANTE },
    });
    if (existe) {
      throw new Error("Ya existe un usuario registrado con esa identificación");
    }

    // Verificar email duplicado
    const emailExiste = await prisma.aSPIRANTE.findFirst({
      where: { email },
    });
    if (emailExiste) {
      throw new Error("Ya existe una cuenta con ese correo electrónico");
    }

    // Encriptar contraseña ANTES de guardar en temporal
    const passwordHash = await bcrypt.hash(password, 10);

    const codigo    = generarCodigo();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Guardar (o reemplazar) registro temporal
    await prisma.cODIGO_VERIFICACION.upsert({
      where:  { email },
      update: {
        codigo,
        expiresAt,
        datos: {
          idASPIRANTE,
          nombre_completo,
          fechaNacimiento,
          email,
          telefono,
          barrio,
          direccion,
          ocupacion,
          institucion: institucion || null,
          password: passwordHash,
        },
      },
      create: {
        email,
        codigo,
        expiresAt,
        datos: {
          idASPIRANTE,
          nombre_completo,
          fechaNacimiento,
          email,
          telefono,
          barrio,
          direccion,
          ocupacion,
          institucion: institucion || null,
          password: passwordHash,
        },
      },
    });

    // Enviar email con código
    await enviarCodigoVerificacion(email, nombre_completo, codigo);

    return { mensaje: "Código enviado al correo", email };
  },

  // ────────────────────────────────────────────────────────────────
  //  VERIFICAR CÓDIGO: valida el código y crea la cuenta definitiva
  // ────────────────────────────────────────────────────────────────
  async verificarCodigoYRegistrar(email, codigo) {
    const registro = await prisma.cODIGO_VERIFICACION.findUnique({
      where: { email },
    });

    if (!registro) {
      throw new Error("No hay un registro pendiente para este correo");
    }

    if (new Date() > new Date(registro.expiresAt)) {
      await prisma.cODIGO_VERIFICACION.delete({ where: { email } });
      throw new Error("El código ha expirado. Por favor regístrate de nuevo");
    }

    if (registro.codigo !== codigo.trim()) {
      throw new Error("Código incorrecto");
    }

    // Código válido → crear aspirante definitivo
    const d = registro.datos;
    const fecha = parseFechaNacimiento(d.fechaNacimiento);

    const nuevoAspirante = await prisma.aSPIRANTE.create({
      data: {
        idASPIRANTE:     d.idASPIRANTE,
        nombre_completo: d.nombre_completo,
        fechaNacimiento: fecha,
        email:           d.email,
        telefono:        d.telefono,
        barrio:          d.barrio,
        direccion:       d.direccion,
        ocupacion:       d.ocupacion,
        institucion:     d.institucion || null,
        password:        d.password,
      },
    });

    // Limpiar registro temporal
    await prisma.cODIGO_VERIFICACION.delete({ where: { email } });

    return nuevoAspirante;
  },

  // ────────────────────────────────────────────────────────────────
  //  REENVIAR CÓDIGO
  // ────────────────────────────────────────────────────────────────
  async reenviarCodigo(email) {
    const registro = await prisma.cODIGO_VERIFICACION.findUnique({
      where: { email },
    });

    if (!registro) {
      throw new Error("No hay un registro pendiente para ese correo");
    }

    const nuevoCodigo = generarCodigo();
    const expiresAt   = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.cODIGO_VERIFICACION.update({
      where:  { email },
      data:   { codigo: nuevoCodigo, expiresAt },
    });

    const nombre = registro.datos?.nombre_completo || "Aspirante";
    await enviarCodigoVerificacion(email, nombre, nuevoCodigo);

    return { mensaje: "Código reenviado correctamente" };
  },

  // ────────────────────────────────────────────────────────────────
  //  REGISTRO ASPIRANTE DIRECTO (compatibilidad legacy)
  // ────────────────────────────────────────────────────────────────
  async registeraspirante(data) {
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

    const correoExistente = await prisma.aSPIRANTE.findFirst({ where: { email } });
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

  // ────────────────────────────────────────────────────────────────
  //  REGISTRO ADMIN
  // ────────────────────────────────────────────────────────────────
  async registeradmin(data) {
    const { idADMIN, nombre, email, password } = data;

    const passwordEncriptado = await bcrypt.hash(password, 10);

    let nuevoAdmin;
    try {
      nuevoAdmin = await prisma.aDMIN.create({
        data: { idADMIN, nombre, email, password: passwordEncriptado }
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

  // ────────────────────────────────────────────────────────────────
  //  LOGIN ASPIRANTE
  // ────────────────────────────────────────────────────────────────
  async loginaspirante(data) {
    const { id, pass } = data;

    const aspirante = await prisma.aSPIRANTE.findUnique({
      where: { idASPIRANTE: id },
    });
    if (!aspirante) return null;

    const valido = await bcrypt.compare(pass, aspirante.password);
    if (!valido) return null;

    const token = jwt.sign(
      { id: aspirante.idASPIRANTE, nombre_completo: aspirante.nombre_completo, rol: "aspirante" },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return { user: aspirante, token, rol: "aspirante", id: aspirante.idASPIRANTE };
  },

  // ────────────────────────────────────────────────────────────────
  //  LOGIN ADMIN
  // ────────────────────────────────────────────────────────────────
  async loginadmin(data) {
    const { id, pass } = data;

    const admin = await prisma.aDMIN.findUnique({ where: { idADMIN: id } });
    if (!admin) return null;

    const valido = await bcrypt.compare(pass, admin.password);
    if (!valido) return null;

    const token = jwt.sign(
      { id: admin.idADMIN, rol: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return { user: admin, id: admin.idADMIN, nombre: admin.nombre, token, rol: "admin" };
  },
};

module.exports = authService;
