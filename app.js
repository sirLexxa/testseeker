const express = require("express");
const { seek } = require("./seeker-dni.js");
const moment = require("moment-timezone");

const app = express();
const PORT = 3000;

app.use(express.json());

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
    const startTime = new Date();
    const result = await seek(dni);
    const endTime = new Date();
    const tiempoConsulta = endTime - startTime;

    // Obtener la hora actual en el huso horario de Perú y formatearla
    const timestampPeru = moment().tz("America/Lima").format("DD/MM/YYYY - HH:mm:ss");

    consultaLogs.push({
      ip: clientIp,
      dni,
      timestamp: timestampPeru,
      tiempoConsulta: `${tiempoConsulta} ms`,
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Error en el servidor" });
  }
});

app.get("/api/logs", (req, res) => {
  res.json(consultaLogs);
});

app.listen(PORT, () => {
  console.log(`Servidor API iniciado en http://localhost:${PORT}`);
});
