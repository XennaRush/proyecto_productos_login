// index.js
import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import path from "path";
import MongoStore from "connect-mongo";
import { conectarDB } from "./bd/connection.js";
import rutasMain from "./rutas/rutas.js";
import rutasUsuario from "./rutas/usuario.js";
import rutasAdmin from "./rutas/admin.js";
import authRoutes from "./rutas/auth.js";
import { crearAdminPorDefecto } from "./bd/usuarioBD.js";

dotenv.config();
const app = express();

// Conectar a MongoDB Atlas y crear admin por defecto
await conectarDB();
await crearAdminPorDefecto();

// --- Middlewares ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");

// Carpeta pública y avatars
app.use(express.static("public"));
app.use("/images", express.static(path.join(process.cwd(), "web", "images")));

// --- Trust Proxy (importante en Vercel) ---
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1); // confía en el primer proxy de Vercel
}

// Sesiones persistentes en MongoDB
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secreto_super_seguro",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 60 * 60 // 1 hora
    }),
    cookie: {
      maxAge: 1000 * 60 * 60, // 1 hora
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" // HTTPS solo en producción
    }
  })
);

// Hacer la sesión disponible en vistas
app.use((req, res, next) => {
  res.locals.sessionUser = req.session?.user || null;
  next();
});

// --- Rutas ---
app.use("/auth", authRoutes);
app.use("/", rutasMain);
app.use("/usuario", rutasUsuario);
app.use("/admin", rutasAdmin);

// 404
app.use((req, res) => {
  res.status(404).render("404", { titulo: "Error 404 - Página no encontrada" });
});

export default app;
