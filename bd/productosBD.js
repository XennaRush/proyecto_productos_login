import Producto from "../models/producto.js";

/**
 * Crear un nuevo producto
 */
export async function crearProducto({ nombre, precio, stock, categoria }, file) {
  try {
    const p = new Producto({
      nombre,
      precio,
      stock,
      categoria,
      imagen: file ? file.filename : "default_producto.png"
    });
    await p.save();
    return p;
  } catch (err) {
    console.error("Error crearProducto:", err);
    throw err;
  }
}

/**
 * Listar todos los productos (ordenados por fecha de creación)
 */
export async function listarProductos() {
  try {
    return await Producto.find().sort({ createdAt: -1 });
  } catch (err) {
    console.error("Error listarProductos:", err);
    throw err;
  }
}

/**
 * Buscar productos por nombre (insensible a mayúsculas/minúsculas)
 */
export async function buscarPorNombre(nombre) {
  try {
    return await Producto.find({ nombre: new RegExp(nombre, "i") });
  } catch (err) {
    console.error("Error buscarPorNombre:", err);
    throw err;
  }
}

/**
 * Obtener un producto por su ID
 */
export async function obtenerPorId(id) {
  try {
    return await Producto.findById(id);
  } catch (err) {
    console.error("Error obtenerPorId:", err);
    throw err;
  }
}

/**
 * Editar un producto
 */
export async function editarProducto({ id, nombre, precio, stock, categoria }, file) {
  try {
    const producto = await Producto.findById(id);
    if (!producto) throw new Error("Producto no encontrado");
    if (nombre) producto.nombre = nombre;
    if (precio) producto.precio = precio;
    if (stock) producto.stock = stock;
    if (categoria) producto.categoria = categoria;
    if (file) producto.imagen = file.filename;
    await producto.save();
    return producto;
  } catch (err) {
    console.error("Error editarProducto:", err);
    throw err;
  }
}

/**
 * Eliminar un producto
 */
export async function borrarProducto(id) {
  try {
    const producto = await Producto.findById(id);
    if (!producto) throw new Error("Producto no encontrado");
    const imagen = producto.imagen;
    await Producto.findByIdAndDelete(id);
    // borrar imagen física si no es default_producto.png
    if (imagen && imagen !== "default_producto.png") {
      const fs = await import("fs");
      const path = await import("path");
      const ruta = path.join(process.cwd(), "web", "images", imagen);
      if (fs.existsSync(ruta)) fs.unlinkSync(ruta);
    }
    return true;
  } catch (err) {
    console.error("Error borrarProducto:", err);
    throw err;
  }
}

/**
 * Disminuir el stock de un producto (cuando un usuario compra)
 * - Valida que haya suficiente stock disponible.
 */
export async function disminuirStock(idProducto, cantidad) {
  try {
    const producto = await Producto.findById(idProducto);
    if (!producto) throw new Error("Producto no encontrado");

    if (producto.stock < cantidad) {
      throw new Error("Stock insuficiente para completar la compra");
    }

    producto.stock -= cantidad;
    await producto.save();
    return producto;
  } catch (err) {
    console.error("Error disminuirStock:", err.message);
    throw err;
  }
}

/**
 * Aumentar el stock de un producto (cuando el administrador repone inventario)
 */
export async function aumentarStock(idProducto, cantidad) {
  try {
    const producto = await Producto.findById(idProducto);
    if (!producto) throw new Error("Producto no encontrado");

    producto.stock += cantidad;
    await producto.save();
    return producto;
  } catch (err) {
    console.error("Error aumentarStock:", err.message);
    throw err;
  }
}