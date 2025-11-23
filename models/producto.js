// models/producto.js
import mongoose from "mongoose";

// Definición del esquema del producto
const productoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del producto es obligatorio"],
      trim: true
    },
    precio: {
      type: Number,
      required: [true, "El precio es obligatorio"],
      min: [0, "El precio no puede ser negativo"]
    },
    stock: {
      type: Number,
      required: [true, "El stock es obligatorio"],
      min: [0, "El stock no puede ser negativo"]
    },
    categoria: {
      type: String,
      required: [true, "La categoría es obligatoria"],
      trim: true
    },
    imagen: {
      type: String,
      default: "default_producto.png"
    }
  },
  {
    timestamps: true // Agrega automáticamente createdAt y updatedAt
  }
);

// Exportar el modelo para usarlo en el CRUD
export default mongoose.model("Producto", productoSchema);
