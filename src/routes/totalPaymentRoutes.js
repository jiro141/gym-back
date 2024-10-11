const express = require("express");
const totalPaymentsController = require("../controllers/totalPaymentsController");
const authenticateToken = require("../middleware/authMiddleware"); // Importa el middleware de autenticación
const router = express.Router();

// Ruta para obtener pagos por día (requiere autenticación)
router.get("/day", authenticateToken, totalPaymentsController.getTotalPaymentsPerDay);

// Ruta para obtener pagos por semana (requiere autenticación)
router.get("/week", authenticateToken, totalPaymentsController.getTotalPaymentsPerWeek);

// Ruta para obtener pagos por mes (requiere autenticación)
router.get("/month", authenticateToken, totalPaymentsController.getTotalPaymentsPerMonth);

// Ruta para obtener pagos por año (requiere autenticación)
router.get("/year", authenticateToken, totalPaymentsController.getTotalPaymentsPerYear);

module.exports = router;
