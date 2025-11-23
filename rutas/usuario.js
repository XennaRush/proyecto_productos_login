// rutas/usuario.js
import { Router } from "express";
import { listarProductos } from "../bd/productosBD.js";
import { crearVenta, listarVentasPorUsuario } from "../bd/ventasBD.js";
import { requireLogin } from "../middlewares/authMiddleware.js";

const router = Router();

/**
 * GET /usuario
 * Muestra el catálogo de productos al usuario
 */
router.get("/", requireLogin, async (req, res) => {
  try {
    const productos = await listarProductos();
    res.render("usuario", { titulo: "Catálogo de Productos", productos });
  } catch (err) {
    console.error("Error GET /usuario:", err);
    res.status(500).send("Error al cargar los productos");
  }
});

/**
 * POST /usuario/comprar
 * Recibe: idProducto, cantidad
 * Crea la venta usando el usuario logueado
 */
router.post("/comprar", requireLogin, async (req, res) => {
  try {
    const { idProducto, cantidad } = req.body;
    const cant = Number(cantidad);
    const comprador = req.session.user.usuario;
    if (!idProducto || !Number.isInteger(cant) || cant <= 0) {
      return res.status(400).send("Datos inválidos: idProducto o cantidad");
    }
    await crearVenta({ idProducto, cantidad: cant, comprador });
    res.redirect("/usuario");
  } catch (err) {
    console.error("Error POST /usuario/comprar:", err);
    res.status(400).send("No se pudo realizar la compra: " + err.message);
  }
});

/**
 * GET /usuario/historial
 * Mostrar historial de compras del usuario logueado
 */
router.get("/historial", requireLogin, async (req, res) => {
  try {
    const ventas = await listarVentasPorUsuario(req.session.user.usuario);
    res.render("ventas", { titulo: "Mis Compras", ventas });
  } catch (err) {
    console.error("Error GET /usuario/historial:", err);
    res.status(500).send("Error al cargar historial");
  }
});

export default router;