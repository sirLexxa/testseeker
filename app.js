const express = require("express");
const { seek } = require("./seeker-dni.js");

const app = express();
const PORT = 3000; // Puedes cambiar el puerto según tus necesidades

app.use(express.json());

// Array para almacenar información de consultas
const consultaLogs = [];

app.get("/api/seek", async (req, res) => {
  const clientIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const dni = req.query.dni;

  if (!dni || !/^\d{8}$/.test(dni)) {
    return res.status(400).json({
      status: false,
      message: "DNI no válido. Debe contener exactamente 8 dígitos.",
    });
  }

  try {
    const result = await seek(dni);

    // Registrar la consulta en el array
    consultaLogs.push({
      ip: clientIp,
      dni,
      timestamp: new Date().toISOString(),
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Error en el servidor" });
  }
});

// Nueva ruta para obtener todos los logs de consultas
app.get("/api/logs", (req, res) => {
  res.json(consultaLogs);
});

app.listen(PORT, () => {
  console.log(`Servidor API iniciado en http://localhost:${PORT}`);
});
