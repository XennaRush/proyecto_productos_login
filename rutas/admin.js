// rutas/admin.js
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
router.get("/productos", async (req, res) => {
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
router.get("/productos/nuevo", (req, res) => {
  res.render("productos", { titulo: "Agregar Producto" });
});

/**
 * POST /admin/productos/nuevo
 * Guardar producto nuevo en BD
 */
router.post("/productos/nuevo", async (req, res) => {
  try {
    await crearProducto(req.body);
    res.redirect("/admin/productos");
  } catch (err) {
    console.error("Error POST /admin/productos/nuevo:", err);
    res.status(500).send("Error al crear producto");
  }
});

/**
 * GET /admin/productos/editar/:id
 * Formulario de edición
 */
router.get("/productos/editar/:id", async (req, res) => {
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
 * Guardar cambios de edición
 * Expect body: { id, nombre, precio, stock, categoria }
 */
router.post("/productos/editar", async (req, res) => {
  try {
    await editarProducto(req.body);
    res.redirect("/admin/productos");
  } catch (err) {
    console.error("Error POST /admin/productos/editar:", err);
    res.status(500).send("Error al editar producto");
  }
});

/**
 * GET /admin/productos/borrar/:id
 */
router.get("/productos/borrar/:id", async (req, res) => {
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
router.post("/productos/aumentarStock", async (req, res) => {
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
router.get("/ventas", async (req, res) => {
  try {
    const ventas = await listarVentas();
    res.render("ventas", { titulo: "Historial de Ventas", ventas });
  } catch (err) {
    console.error("Error GET /admin/ventas:", err);
    res.status(500).send("Error al listar ventas");
  }
});

export default router;