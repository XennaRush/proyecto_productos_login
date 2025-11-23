// server.js
import app from "./index.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor local en ejecución: http://localhost:${PORT}`);
});