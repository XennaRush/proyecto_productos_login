// index.js
import express from "express";
import dotenv from "dotenv";
import { conectarDB } from "./bd/connection.js";

// Importar las rutas
import rutasMain from "./rutas/rutas.js";       // Página principal
import rutasUsuario from "./rutas/usuario.js";  // Panel de usuario
import rutasAdmin from "./rutas/admin.js";      // Panel de administrador

// Cargar variables de entorno (.env)
dotenv.config();

// Inicializar aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Conectar a la base de datos
await conectarDB();

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.use(express.static("public"));

// Rutas principales
app.use("/", rutasMain);        // Página de inicio
app.use("/usuario", rutasUsuario); // Rutas del usuario (comprar productos)
app.use("/admin", rutasAdmin);     // Rutas del administrador (gestión productos/ventas)

// Página 404 si no se encuentra la ruta
app.use((req, res) => {
  res.status(404).render("404", { titulo: "Error 404 - Página no encontrada" });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor en ejecución: http://localhost:${PORT}`);
});
