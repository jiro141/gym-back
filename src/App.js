const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser"); // Aunque Express tiene su propio middleware JSON, es válido mantener esto si se usan otras configuraciones.
const sequelize = require("./config/database");

// Rutas
const userRoutes = require("./routes/userRoutes");
const clientRoutes = require("./routes/clientRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const totalPaymentRoutes = require("./routes/totalPaymentRoutes"); // Importa las rutas de totalPayments
const fingerprintRoutes = require("./routes/fingerprintRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const base64 = require("base-64");

// Inicialización del cron job (por ejemplo, para resetear asistencia)
require("./jobs/resetAttendance");

// Shim para btoa y atob en Node.js
global.btoa = function (string) {
  return base64.encode(string);
};

global.atob = function (encodedString) {
  return base64.decode(encodedString);
};

// Middleware de CORS y Body Parser
app.use(cors());
app.use(bodyParser.json());

// Rutas API
app.use("/api/users", userRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payments", paymentRoutes); // Rutas para CRUD de pagos
app.use("/api/total-payments", totalPaymentRoutes); // Rutas para los totales de pagos (día, semana, mes, año)
// app.use("/api/fingerprint", fingerprintRoutes); // Puedes habilitar esto si lo necesitas

// Sincronización con la base de datos y lanzamiento del servidor
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database & tables created!");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

module.exports = app;
