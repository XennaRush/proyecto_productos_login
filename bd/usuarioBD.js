// bd/usuarioBD.js
import Usuario from "../models/usuario.js";
import fs from "fs";
import path from "path";
import { uploadsDir } from "../middlewares/subirArchivos.js"; // para borrar archivos

// Registrar usuario (file es req.file o undefined)
export async function registrarUsuario(datos, file) {
  try {
    // Verificar duplicado de usuario
    const existe = await Usuario.findOne({ usuario: datos.usuario });
    if (existe) return { exito: false, mensaje: "El usuario ya existe" };

    const nuevo = new Usuario({
      nombre: datos.nombre,
      usuario: datos.usuario,
      contrasenya: datos.contrasenya,
      rol: "usuario", // siempre usuario normal al registrar
      avatar: file ? file.filename : "default.png"
    });

    await nuevo.save();
    return { exito: true, usuario: nuevo };
  } catch (err) {
    console.error("registrarUsuario:", err);
    return { exito: false, mensaje: err.message };
  }
}

// Verificar login (texto plano)
export async function verificarUsuario({ usuario, contrasenya }) {
  try {
    const u = await Usuario.findOne({ usuario, contrasenya });
    if (!u) return { exito: false, mensaje: "Usuario o contraseña incorrectos" };
    return { exito: true, usuario: u };
  } catch (err) {
    console.error("verificarUsuario:", err);
    return { exito: false, mensaje: err.message };
  }
}

export async function obtenerUsuarioPorId(id) {
  return Usuario.findById(id).lean();
}

// Actualizar usuario (nombre, usuario, posible avatar)
export async function actualizarUsuario(id, datos, file) {
  try {
    const user = await Usuario.findById(id);
    if (!user) return { exito: false, mensaje: "Usuario no encontrado" };

    if (datos.nombre) user.nombre = datos.nombre;
    if (datos.usuario) user.usuario = datos.usuario;
    // no cambiamos contraseña (según requerimiento)

    if (file) {
      const anterior = user.avatar;
      user.avatar = file.filename;
      // borrar archivo anterior físico si no es default.png
      if (anterior && anterior !== "default.png") {
        const ruta = path.join(uploadsDir, anterior);
        if (fs.existsSync(ruta)) fs.unlinkSync(ruta);
      }
    } else if (datos.avatar) {
      // Si se solicita borrar avatar, poner default.png
      user.avatar = datos.avatar;
    }

    const guardado = await user.save();
    return { exito: true, usuario: guardado };
  } catch (err) {
    console.error("actualizarUsuario:", err);
    return { exito: false, mensaje: err.message };
  }
}

// Actualizar solo el rol de un usuario (por admin)
export async function actualizarRolUsuario(id, nuevoRol) {
  try {
    const user = await Usuario.findById(id);
    if (!user) return { exito: false, mensaje: "Usuario no encontrado" };
    user.rol = nuevoRol;
    await user.save();
    return { exito: true, usuario: user };
  } catch (err) {
    console.error("actualizarRolUsuario:", err);
    return { exito: false, mensaje: err.message };
  }
}

// Eliminar usuario y borrar avatar físico si aplica
export async function eliminarUsuario(id) {
  try {
    const user = await Usuario.findById(id);
    if (!user) return { exito: false, mensaje: "Usuario no encontrado" };

    const avatar = user.avatar;
    await Usuario.findByIdAndDelete(id);

    if (avatar && avatar !== "default.png") {
      const ruta = path.join(uploadsDir, avatar);
      if (fs.existsSync(ruta)) fs.unlinkSync(ruta);
    }
    return { exito: true };
  } catch (err) {
    console.error("eliminarUsuario:", err);
    return { exito: false, mensaje: err.message };
  }
}

// Crear admin por defecto si no existe (invocar desde index.js al arrancar)
export async function crearAdminPorDefecto() {
  try {
    const adminUsuario = "admin";
    const adminPass = "admin123";
    const existe = await Usuario.findOne({ usuario: adminUsuario });
    // Si no existe, crear el primer admin en la BD
    if (!existe) {
      const nuevo = new Usuario({
        nombre: "Administrador",
        usuario: adminUsuario,
        contrasenya: adminPass,
        rol: "admin",
        avatar: "default.png"
      });
      await nuevo.save();
      console.log("Admin por defecto creado -> usuario: admin / pass: admin123");
    } else {
      console.log("Admin por defecto ya existe.");
    }
  } catch (err) {
    console.error("crearAdminPorDefecto:", err);
  }
}

// Listar todos los usuarios (para admin)
export async function listarUsuarios() {
  return Usuario.find({}).lean();
}
