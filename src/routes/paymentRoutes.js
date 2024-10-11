const express = require("express");
const paymentController = require("../controllers/paymentController");
const authenticateToken = require("../middleware/authMiddleware"); // Importa el middleware de autenticación
const router = express.Router();

// Ruta para crear un nuevo pago (requiere autenticación)
router.post("/", authenticateToken, paymentController.createPayment);

// Ruta para obtener todos los pagos (requiere autenticación)
router.get("/", authenticateToken, paymentController.getPayments);

// Ruta para actualizar un pago por su ID (requiere autenticación)
router.put("/:id", authenticateToken, paymentController.updatePayment);

// Ruta para eliminar un pago por su ID (requiere autenticación)
router.delete("/:id", authenticateToken, paymentController.deletePayment);

module.exports = router;
