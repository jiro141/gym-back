const Payment = require("../models/payment");
const sequelize = require("../config/database");

// Pagos Totales por Día
exports.getTotalPaymentsPerDay = async (req, res) => {
  try {
    const { currency } = req.query; // Moneda: "pesos" o "dolares"

    // Sumar pagos por día
    const payments = await Payment.findAll({
      attributes: [
        [sequelize.fn("DATE", sequelize.col("createdAt")), "date"], // Agrupar por día
        [sequelize.fn("SUM", sequelize.col("amount")), "totalPayments"], // Sumar pagos
      ],
      where: {
        currency: currency, // Filtrar por moneda
      },
      group: [sequelize.fn("DATE", sequelize.col("createdAt"))], // Agrupar por día
      order: [[sequelize.fn("DATE", sequelize.col("createdAt")), "ASC"]], // Ordenar por fecha ascendente
      raw: true, // Añadir para resultados simples
    });

    // Si el número de registros supera 7, desplazar para mantener el último intervalo de 7 días
    const maxEntries = 7;
    let limitedPayments = payments;

    // Si la cantidad de pagos excede el límite, solo tomamos los últimos 7
    if (payments.length > maxEntries) {
      limitedPayments = payments.slice(-maxEntries);
    }

    // Responder con los últimos 7 registros (o menos si hay menos en total)
    res.status(200).json(limitedPayments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Pagos Totales por Semana
exports.getTotalPaymentsPerWeek = async (req, res) => {
  try {
    const { currency } = req.query; // Moneda: "pesos" o "dolares"

    // Sumar pagos por semana (SQLite usa `strftime` para fechas)
    const payments = await Payment.findAll({
      attributes: [
        [sequelize.fn("strftime", "%Y", sequelize.col("createdAt")), "year"], // Año
        [sequelize.fn("strftime", "%W", sequelize.col("createdAt")), "week"], // Semana
        [sequelize.fn("SUM", sequelize.col("amount")), "totalPayments"], // Sumar pagos
      ],
      where: {
        currency: currency, // Filtrar por moneda
      },
      group: [
        sequelize.fn("strftime", "%Y", sequelize.col("createdAt")), // Agrupar por año
        sequelize.fn("strftime", "%W", sequelize.col("createdAt")), // Agrupar por semana
      ],
      order: [
        [sequelize.fn("strftime", "%Y", sequelize.col("createdAt")), "ASC"],
        [sequelize.fn("strftime", "%W", sequelize.col("createdAt")), "ASC"],
      ],
      raw: true, // Asegurar resultados simples
    });

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Pagos Totales por Mes
exports.getTotalPaymentsPerMonth = async (req, res) => {
  try {
    const { currency } = req.query; // Moneda: "pesos" o "dolares"

    // Sumar pagos por mes (SQLite usa `strftime` para fechas)
    const payments = await Payment.findAll({
      attributes: [
        [sequelize.fn("strftime", "%Y", sequelize.col("createdAt")), "year"], // Año
        [sequelize.fn("strftime", "%m", sequelize.col("createdAt")), "month"], // Mes
        [sequelize.fn("SUM", sequelize.col("amount")), "totalPayments"], // Sumar pagos
      ],
      where: {
        currency: currency, // Filtrar por moneda
      },
      group: [
        sequelize.fn("strftime", "%Y", sequelize.col("createdAt")), // Agrupar por año
        sequelize.fn("strftime", "%m", sequelize.col("createdAt")), // Agrupar por mes
      ],
      order: [
        [sequelize.fn("strftime", "%Y", sequelize.col("createdAt")), "ASC"],
        [sequelize.fn("strftime", "%m", sequelize.col("createdAt")), "ASC"],
      ],
      raw: true, // Asegurar resultados simples
    });

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Pagos Totales por Año
exports.getTotalPaymentsPerYear = async (req, res) => {
  try {
    const { currency } = req.query; // Moneda: "pesos" o "dolares"

    // Sumar pagos por año (SQLite usa `strftime` para fechas)
    const payments = await Payment.findAll({
      attributes: [
        [sequelize.fn("strftime", "%Y", sequelize.col("createdAt")), "year"], // Año
        [sequelize.fn("SUM", sequelize.col("amount")), "totalPayments"], // Sumar pagos
      ],
      where: {
        currency: currency, // Filtrar por moneda
      },
      group: [sequelize.fn("strftime", "%Y", sequelize.col("createdAt"))], // Agrupar por año
      order: [
        [sequelize.fn("strftime", "%Y", sequelize.col("createdAt")), "ASC"],
      ],
      raw: true, // Asegurar resultados simples
    });

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
