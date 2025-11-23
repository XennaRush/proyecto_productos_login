export function subirImagenProducto() {
  return multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }
  }).single("imagen");
}
// middlewares/subirArchivos.js
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadsDir = path.join(process.cwd(), "web", "images");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${unique}${ext}`);
  }
});

export function subirAvatar() {
  return multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB
  }).single("avatar");
}

export { uploadsDir };