const Payment = require("../models/payment");

exports.createPayment = async (req, res) => {
  try {
    const { amount, currency } = req.body;

    // Crear un nuevo pago
    const payment = await Payment.create({
      amount,
      currency,
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPayments = async (req, res) => {
  try {
    // Obtener todos los pagos
    const payments = await Payment.findAll();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, currency } = req.body;

    // Buscar el pago por su ID
    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Actualizar el pago
    await payment.update({
      amount,
      currency,
    });

    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar el pago por su ID
    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Eliminar el pago
    await payment.destroy();

    res.status(200).json({ message: "Payment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
