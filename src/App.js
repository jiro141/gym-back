// src/app.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); // Importar el paquete cors
const userRoutes = require("./routes/userRoutes");
const clientRoutes = require("./routes/clientRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const sequelize = require("./config/database");
const User = require("./models/user");
const Client = require("./models/client");
const cron = require("node-cron");
const fingerprintRoutes = require("./routes/fingerprintRoutes");
const app = express();
const PORT = process.env.PORT || 5000;

const base64 = require("base-64");

// Agregar shims para btoa y atob en el entorno global
global.btoa = function (string) {
  return base64.encode(string);
};

global.atob = function (encodedString) {
  return base64.decode(encodedString);
};

// Configurar CORS
app.use(cors());

app.use(bodyParser.json());
app.use("/api/users", userRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/fingerprint", fingerprintRoutes);
// Sincronización de la base de datos y arranque del servidor
sequelize.sync({ force: false }).then(() => {
  console.log("Database & tables created!");
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

// Cron job para restablecer la asistencia a diario a las 00:00
cron.schedule("0 0 * * *", async () => {
  try {
    await Client.update({ attendance: false }, { where: {} });
    console.log("Attendance reset for all clients");
  } catch (error) {
    console.error("Error resetting attendance:", error);
  }
});

module.exports = app;
