// index.js
import express from "express";
import dotenv from "dotenv";
import { conectarDB } from "./bd/connection.js";

// Importar rutas
import rutasMain from "./rutas/rutas.js";
import rutasUsuario from "./rutas/usuario.js";
import rutasAdmin from "./rutas/admin.js";

dotenv.config();

const app = express();

// Conexión a la base de datos
await conectarDB();

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.use(express.static("public"));

// Rutas
app.use("/", rutasMain);
app.use("/usuario", rutasUsuario);
app.use("/admin", rutasAdmin);

// Página 404
app.use((req, res) => {
  res.status(404).render("404", { titulo: "Error 404 - Página no encontrada" });
});

// IMPORTANTE: quitar app.listen() y exportar la app
export default app;
