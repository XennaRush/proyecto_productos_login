// models/venta.js
import mongoose from "mongoose";

const ventaSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Producto",
    required: true
  },
  cantidad: {
    type: Number,
    required: true,
    min: 1
  },
  precioUnitario: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  comprador: {
    type: String,
    default: "Anónimo"
  }
}, { timestamps: true });

export default mongoose.model("Venta", ventaSchema);
