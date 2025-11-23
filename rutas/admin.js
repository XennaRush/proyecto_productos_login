// rutas/admin.js
import { requireAdmin } from "../middlewares/authMiddleware.js";
import { subirAvatar } from "../middlewares/subirArchivos.js";
import { subirImagenProducto } from "../middlewares/subirArchivos.js";

import { Router } from "express";
import {
  crearProducto,
  listarProductos,
  obtenerPorId,
  editarProducto,
  borrarProducto,
  aumentarStock
} from "../bd/productosBD.js";
import { listarVentas } from "../bd/ventasBD.js";
import { listarUsuarios, actualizarUsuario, eliminarUsuario, actualizarRolUsuario } from "../bd/usuarioBD.js";

const router = Router();

/**
 * GET /admin
 * opcion: redirigir a productos (si alguien entra a /admin)
 */
router.get("/", (req, res) => {
  res.redirect("/admin/productos");
});

/**
 * GET /admin/productos
 * Listado para administración
 */
router.get("/productos", requireAdmin, async (req, res) => {
  try {
    const productos = await listarProductos();
    res.render("mostrar_productos", { titulo: "Administrar Productos", productos });
  } catch (err) {
    console.error("Error GET /admin/productos:", err);
    res.status(500).send("Error al listar productos");
  }
});

/**
 * GET /admin/productos/nuevo
 * Formulario para crear producto
 */
router.get("/productos/nuevo", requireAdmin, (req, res) => {
  res.render("productos", { titulo: "Agregar Producto" });
});

/**
 * POST /admin/productos/nuevo
 * Guardar producto nuevo en BD (con imagen)
 */
router.post("/productos/nuevo", requireAdmin, (req, res) => {
  subirImagenProducto()(req, res, async function (err) {
    if (err) return res.status(400).send(err.message);
    try {
      await crearProducto(req.body, req.file);
      res.redirect("/admin/productos");
    } catch (err) {
      console.error("Error POST /admin/productos/nuevo:", err);
      res.status(500).send("Error al crear producto");
    }
  });
});

/**
 * GET /admin/productos/editar/:id
 * Formulario de edición
 */
router.get("/productos/editar/:id", requireAdmin, async (req, res) => {
  try {
    const producto = await obtenerPorId(req.params.id);
    if (!producto) return res.status(404).render("404", { titulo: "Producto no encontrado" });
    res.render("editar_producto", { titulo: "Editar Producto", producto });
  } catch (err) {
    console.error("Error GET /admin/productos/editar/:id:", err);
    res.status(500).send("Error al obtener producto");
  }
});

/**
 * POST /admin/productos/editar
 * Guardar cambios de edición (con imagen)
 */
router.post("/productos/editar", requireAdmin, (req, res) => {
  subirAvatar()(req, res, async function (err) {
    if (err) return res.status(400).send(err.message);
    try {
      await editarProducto(req.body, req.file);
      res.redirect("/admin/productos");
    } catch (err) {
      console.error("Error POST /admin/productos/editar:", err);
      res.status(500).send("Error al editar producto");
    }
  });
});

/**
 * GET /admin/productos/borrar/:id
 */
router.get("/productos/borrar/:id", requireAdmin, async (req, res) => {
  try {
    await borrarProducto(req.params.id);
    res.redirect("/admin/productos");
  } catch (err) {
    console.error("Error GET /admin/productos/borrar/:id:", err);
    res.status(500).send("Error al borrar producto");
  }
});

/**
 * POST /admin/productos/aumentarStock
 * body: { idProducto, cantidad }
 */
router.post("/productos/aumentarStock", requireAdmin, async (req, res) => {
  try {
    const { idProducto, cantidad } = req.body;
    const cant = Number(cantidad);
    if (!idProducto || !Number.isInteger(cant) || cant <= 0) {
      return res.status(400).send("Datos inválidos");
    }
    await aumentarStock(idProducto, cant);
    res.redirect("/admin/productos");
  } catch (err) {
    console.error("Error POST /admin/productos/aumentarStock:", err);
    res.status(500).send("Error al aumentar stock: " + err.message);
  }
});

/**
 * GET /admin/ventas
 * Mostrar historial de ventas
 */

router.get("/ventas", requireAdmin, async (req, res) => {
  try {
    const ventas = await listarVentas();
    res.render("ventas", { titulo: "Historial de Ventas", ventas });
  } catch (err) {
    console.error("Error GET /admin/ventas:", err);
    res.status(500).send("Error al listar ventas");
  }
});

/**
 * GET /admin/usuarios
 * Listar todos los usuarios para el admin
 */
router.get("/usuarios", requireAdmin, async (req, res) => {
  try {
    const usuarios = await listarUsuarios();
    res.render("usuarios_admin", { titulo: "Usuarios", usuarios });
  } catch (err) {
    console.error("Error GET /admin/usuarios:", err);
    res.status(500).send("Error al listar usuarios");
  }
});

/**
 * POST /admin/usuarios/editar
 * Editar usuario (solo rol)
 */
router.post("/usuarios/editar", requireAdmin, async (req, res) => {
  try {
    const { id, rol } = req.body;
    if (!id || !rol) return res.status(400).send("Datos inválidos");
    const r = await actualizarRolUsuario(id, rol);
    if (!r.exito) return res.status(500).send(r.mensaje);
    // Si el usuario editado es el mismo que el de la sesión, actualizar el rol en la sesión
    if (req.session.user && req.session.user.id === id) {
      req.session.user.rol = rol;
    }
    res.redirect("/admin/usuarios");
  } catch (err) {
    console.error("Error POST /admin/usuarios/editar:", err);
    res.status(500).send("Error al editar usuario");
  }
});

/**
 * POST /admin/usuarios/borrar
 * Borrar usuario
 */
router.post("/usuarios/borrar", requireAdmin, async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).send("ID inválido");
    const r = await eliminarUsuario(id);
    if (!r.exito) return res.status(500).send(r.mensaje);
    res.redirect("/admin/usuarios");
  } catch (err) {
    console.error("Error POST /admin/usuarios/borrar:", err);
    res.status(500).send("Error al borrar usuario");
  }
});


export default router;