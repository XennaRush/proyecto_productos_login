// middlewares/authMiddleware.js
export function requireLogin(req, res, next) {
  if (!req.session?.user) return res.redirect("/auth/login");
  next();
}

export function requireAdmin(req, res, next) {
  if (req.session?.user?.rol === "admin") return next();
  // redirige a catálogo si no es admin
  return res.redirect("/usuario");
}