const express = require("express");
const { seek } = require("./seeker-dni.js");

const app = express();
const PORT = 3000; // Puedes cambiar el puerto según tus necesidades

app.use(express.json());

app.get("/api/seek", async (req, res) => {
  const dni = req.query.dni;

  if (!dni) {
    return res.status(400).json({ status: false, message: "DNI no proporcionado en la consulta." });
  }

  try {
    const result = await seek(dni);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Error en el servidor" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor API iniciado en http://localhost:${PORT}`);
});
