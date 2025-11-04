// bd/ventasBD.js
import Venta from "../models/venta.js";
import { obtenerPorId, disminuirStock } from "./productosBD.js";

/**
 * Registrar una nueva venta
 * - Verifica que el producto exista y haya stock suficiente
 * - Disminuye el stock en la colección de productos
 * - Crea el registro en la colección de ventas
 */
export async function crearVenta({ idProducto, cantidad, comprador }) {
  try {
    // 1️ Buscar el producto
    const producto = await obtenerPorId(idProducto);
    if (!producto) throw new Error("Producto no encontrado");

    // 2️ Verificar stock
    if (producto.stock < cantidad) {
      throw new Error("Stock insuficiente para completar la compra");
    }

    // 3️ Disminuir el stock del producto
    await disminuirStock(idProducto, cantidad);

    // 4️ Calcular precio total
    const total = producto.precio * cantidad;

    // 5️ Crear la venta
    const nuevaVenta = new Venta({
      producto: producto._id,
      cantidad,
      precioUnitario: producto.precio,
      total,
      comprador: comprador || "Anónimo"
    });

    await nuevaVenta.save();
    return nuevaVenta;
  } catch (err) {
    console.error("Error crearVenta:", err.message);
    throw err;
  }
}

/**
 * Listar todas las ventas registradas (con detalles del producto)
 */
export async function listarVentas() {
  try {
    return await Venta.find()
      .populate("producto", "nombre precio categoria") // une info del producto
      .sort({ createdAt: -1 });
  } catch (err) {
    console.error("Error listarVentas:", err.message);
    throw err;
  }
}

/**
 * Obtener una venta por su ID
 */
export async function obtenerVentaPorId(id) {
  try {
    return await Venta.findById(id).populate("producto", "nombre precio categoria");
  } catch (err) {
    console.error("Error obtenerVentaPorId:", err.message);
    throw err;
  }
}