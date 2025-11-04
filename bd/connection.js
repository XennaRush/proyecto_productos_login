import mongoose from "mongoose"; // Librería para trabajar con MongoDB
import dotenv from "dotenv";     // Librería para leer variables de entorno

// Cargar las variables definidas en .env
dotenv.config();

export async function conectarDB() {
  // Obtener la URI de conexión desde la variable de entorno
  const uri = process.env.MONGO_URI;

  // Si no se definió MONGO_URI, mostramos un error y detenemos la app
  if (!uri) {
    console.error("MONGO_URI no está definido en .env");
    process.exit(1); // Termina la ejecución del programa
  }

  try {
    // Conectar a MongoDB usando Mongoose
    await mongoose.connect(uri, {
      useNewUrlParser: true,      // Para usar el nuevo parser de URL
      useUnifiedTopology: true    // Para usar el motor de topología moderna
    });

    console.log("Conexión establecida con MongoDB");
  } catch (err) {
    // Si ocurre un error al conectar, lo mostramos y detenemos la app
    console.error("Error conectando a MongoDB:", err);
    process.exit(1);
  }
}