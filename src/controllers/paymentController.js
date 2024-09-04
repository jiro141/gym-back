// src/controllers/paymentController.js
const Payment = require('../models/payment');

exports.recordPayment = async (req, res) => {
  try {
    const payment = await Payment.create(req.body);
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Otros métodos CRUD...
