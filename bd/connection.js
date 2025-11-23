import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function conectarDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("❌ FALTA MONGO_URI en .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ Conectado correctamente a MongoDB Atlas");
  } catch (err) {
    console.error("❌ Error al conectar a MongoDB:", err.message);
    process.exit(1);
  }
}
