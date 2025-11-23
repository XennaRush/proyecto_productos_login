// index.js
import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import path from "path";
import { conectarDB } from "./bd/connection.js";
import rutasMain from "./rutas/rutas.js";
import rutasUsuario from "./rutas/usuario.js";
import rutasAdmin from "./rutas/admin.js";
import authRoutes from "./rutas/auth.js";
import { crearAdminPorDefecto } from "./bd/usuarioBD.js";

dotenv.config();
const app = express();

// conectar BD y crear admin por defecto
await conectarDB();
await crearAdminPorDefecto();

// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");

// carpeta pública y avatars
app.use(express.static("public"));
// exponer avatars en /avatars
app.use("/images", express.static(path.join(process.cwd(), "web", "images")));

// sesiones
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secreto_super_seguro",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60, // 1 hora
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" // solo https en producción
    }
  })
);
// Las imágenes de perfil se almacenan en /web/images y se acceden vía /images/<nombreArchivo>

// hacer la sesión disponible en vistas (opcional)
app.use((req, res, next) => {
  res.locals.sessionUser = req.session?.user || null;
  next();
});

// rutas
app.use("/auth", authRoutes); // rutas de auth: /auth/login, /auth/registrar, etc.
app.use("/", rutasMain);
app.use("/usuario", rutasUsuario);
app.use("/admin", rutasAdmin);

// 404
app.use((req, res) => {
  res.status(404).render("404", { titulo: "Error 404 - Página no encontrada" });
});

export default app;