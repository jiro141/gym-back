// src/routes/paymentRoutes.js
const express = require('express');
const paymentController = require('../controllers/paymentController');
const router = express.Router();

router.post('/', paymentController.recordPayment);
// Otras rutas CRUD...

module.exports = router;
