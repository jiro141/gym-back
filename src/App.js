// src/app.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); // Import CORS package
const userRoutes = require("./routes/userRoutes");
const clientRoutes = require("./routes/clientRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const sequelize = require("./config/database");
const User = require("./models/user");
const Client = require("./models/client");
const fingerprintRoutes = require("./routes/fingerprintRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const app = express();
const PORT = process.env.PORT || 5000;
const base64 = require("base-64");

// Import and initialize the cron job from resetAttendance
require("./jobs/resetAttendance"); // This will run the cron job

// Add shims for btoa and atob in the global environment
global.btoa = function (string) {
  return base64.encode(string);
};

global.atob = function (encodedString) {
  return base64.decode(encodedString);
};

// Configure CORS
app.use(cors());
app.use(bodyParser.json());
app.use("/api/users", userRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payments", paymentRoutes);
// app.use("/api/fingerprint", fingerprintRoutes);

// Database sync and server start
sequelize.sync({ force: false }).then(() => {
  console.log("Database & tables created!");
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

module.exports = app;
