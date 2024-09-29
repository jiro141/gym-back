// src/controllers/paymentController.js
const Payment = require('../models/payment');
const Client = require('../models/client');

exports.createPayment = async (req, res) => {
  try {
    const { clientId, amount, paymentType } = req.body;

    // Verificar que el cliente exista
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Calcular la fecha del próximo pago dependiendo del tipo de membresía
    let nextPaymentDue = null;
    const today = new Date();

    if (client.membershipType === 'semanal') {
      nextPaymentDue = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 días
    } else if (client.membershipType === 'mensual') {
      nextPaymentDue = new Date(today.setMonth(today.getMonth() + 1)); // 1 mes
    } else if (client.membershipType === 'permanente') {
      nextPaymentDue = null;  // Membresía permanente no tiene próximo pago
    }

    const payment = await Payment.create({
      clientId,
      amount,
      paymentType,
      nextPaymentDue
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPaymentsByClient = async (req, res) => {
  try {
    const { clientId } = req.params;

    const client = await Client.findByPk(clientId, {
      include: {
        model: Payment,
        as: 'payments'
      }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.status(200).json(client.payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentDate } = req.body;

    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    await payment.update({
      amount,
      paymentDate
    });

    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
