// rutas/rutas.js
import { Router } from "express";
import { buscarPorNombre, listarProductos } from "../bd/productosBD.js";

const router = Router();

/**
 * Página principal (inicio)
 */
router.get("/", async (req, res) => {
  try {
    // opcional tal vez quien sabe: mostrar algunos productos en la portada
    const productos = await listarProductos();
    res.render("index", { titulo: "Inicio", productos });
  } catch (err) {
    console.error("Error en GET /:", err);
    res.status(500).render("404", { titulo: "Error" });
  }
});

/**
 * Buscador global (form en header.ejs)
 * Envia resultados a la vista mostrar_productos (reutilizable)
 */
router.post("/buscar", async (req, res) => {
  try {
    const term = (req.body.buscar || "").trim();
    const productos = term ? await buscarPorNombre(term) : [];
    res.render("mostrar_productos", { titulo: `Resultados: ${term}`, productos, term });
  } catch (err) {
    console.error("Error en POST /buscar:", err);
    res.status(500).send("Error en la búsqueda");
  }
});

export default router;