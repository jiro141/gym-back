// src/routes/paymentRoutes.js
const express = require('express');
const paymentController = require('../controllers/paymentController');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', authenticateToken, paymentController.createPayment);
router.get('/:clientId', authenticateToken, paymentController.getPaymentsByClient);
router.put('/:id', authenticateToken, paymentController.updatePayment);

module.exports = router;
