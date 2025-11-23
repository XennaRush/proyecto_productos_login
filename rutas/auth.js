// rutas/auth.js
import { Router } from "express";
import { subirAvatar } from "../middlewares/subirArchivos.js";
import {
  registrarUsuario,
  verificarUsuario,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario
} from "../bd/usuarioBD.js";

import { requireLogin } from "../middlewares/authMiddleware.js";

const router = Router();

// ---- Rutas de autenticación ----

// GET: formulario login
router.get("/login", (req, res) => {
  res.render("login.ejs", { error: null });
});

// POST: procesar login
router.post("/login", async (req, res) => {
  const { usuario, contrasenya } = req.body;
  const r = await verificarUsuario({ usuario, contrasenya });
  if (!r.exito) return res.render("login.ejs", { error: r.mensaje });

  // Guardar info mínima en sesión
  req.session.user = {
    id: r.usuario._id.toString(),
    nombre: r.usuario.nombre,
    usuario: r.usuario.usuario,
    rol: r.usuario.rol,
    avatar: r.usuario.avatar || "default.png"
  };

  // Guardar sesión antes de redirigir
  req.session.save(err => {
    if (err) {
      console.error("Error guardando sesión:", err);
      return res.render("login.ejs", { error: "Error guardando sesión" });
    }

    // Redirigir según rol
    if (r.usuario.rol === "admin") return res.redirect("/admin");
    return res.redirect("/usuario");
  });
});

// GET: formulario registro
router.get("/registrar", (req, res) => {
  res.render("registrar.ejs", { error: null });
});

// POST: registrar con posible avatar
router.post("/registrar", (req, res) => {
  subirAvatar()(req, res, async function (err) {
    if (err) return res.render("registrar.ejs", { error: err.message });

    const r = await registrarUsuario(req.body, req.file);
    if (!r.exito) return res.render("registrar.ejs", { error: r.mensaje });

    return res.redirect("/auth/login");
  });
});

// GET: cerrar sesión
router.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) console.error("Error destruyendo sesión:", err);
    res.redirect("/auth/login");
  });
});

// PERFIL -> requiere login
router.get("/perfil", requireLogin, async (req, res) => {
  const usuario = await obtenerUsuarioPorId(req.session.user.id);
  res.render("perfil.ejs", { usuario, error: null });
});

// GET editar perfil
router.get("/perfil/editar", requireLogin, async (req, res) => {
  const usuario = await obtenerUsuarioPorId(req.session.user.id);
  res.render("editar_perfil.ejs", { usuario, error: null });
});

// POST editar perfil (nombre, usuario, avatar)
router.post("/perfil/editar", requireLogin, (req, res) => {
  subirAvatar()(req, res, async function (err) {
    if (err) return res.status(400).send(err.message);

    // Borrar avatar si se solicita
    if (req.body.borrarAvatar) {
      const usuario = await obtenerUsuarioPorId(req.session.user.id);
      if (usuario.avatar && usuario.avatar !== "default.png") {
        const fs = await import("fs");
        const path = await import("path");
        const { uploadsDir } = await import("../middlewares/subirArchivos.js");
        const ruta = path.join(uploadsDir, usuario.avatar);
        if (fs.existsSync(ruta)) fs.unlinkSync(ruta);
      }
      req.file = null;
      req.body.avatar = "default.png";
    }

    const r = await actualizarUsuario(req.session.user.id, req.body, req.file);
    if (!r.exito) return res.status(500).send(r.mensaje);

    // Actualizar sesión y guardar antes de redirigir
    req.session.user.nombre = r.usuario.nombre;
    req.session.user.usuario = r.usuario.usuario;
    req.session.user.avatar = r.usuario.avatar || "default.png";

    req.session.save(err => {
      if (err) console.error("Error guardando sesión:", err);
      res.redirect("/auth/perfil");
    });
  });
});

// POST eliminar cuenta (requiere login)
router.post("/perfil/eliminar", requireLogin, async (req, res) => {
  const r = await eliminarUsuario(req.session.user.id);
  if (!r.exito) return res.status(500).send(r.mensaje);

  req.session.destroy(err => {
    if (err) console.error("Error destruyendo sesión:", err);
    res.redirect("/auth/registrar");
  });
});

export default router;
