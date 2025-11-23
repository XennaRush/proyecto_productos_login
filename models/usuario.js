// models/usuario.js
import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  usuario: { type: String, required: true, trim: true, unique: true },
  contrasenya: { type: String, required: true, trim: true },
  rol: { type: String, enum: ["usuario", "admin"], default: "usuario" },
  avatar: { type: String, default: "default.png" } // archivo en public/avatars
});

export default mongoose.model("Usuario", usuarioSchema);
