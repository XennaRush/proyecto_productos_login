// rutas/usuario.js
import { Router } from "express";
import { listarProductos } from "../bd/productosBD.js";
import { crearVenta } from "../bd/ventasBD.js";

const router = Router();

/**
 * GET /usuario
 * Muestra el catálogo de productos al usuario
 */
router.get("/", async (req, res) => {
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
 * Recibe: idProducto, cantidad, comprador
 * Crea la venta (crearVenta valida stock y disminuye)
 */
router.post("/comprar", async (req, res) => {
  try {
    const { idProducto, cantidad, comprador } = req.body;
    const cant = Number(cantidad);

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

export default router;