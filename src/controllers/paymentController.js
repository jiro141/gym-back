const Payment = require("../models/payment");
const Client = require("../models/client");
const sequelize = require("../config/database");
exports.createPayment = async (req, res) => {
  try {
    const { amount, currency, clientID } = req.body;

    // No es necesario verificar si clientID está presente, se puede permitir nulo
    // Si el clientID no está presente (es nulo o undefined), lo dejamos como null en la base de datos
    const payment = await Payment.create({
      amount,
      currency,
      clientID: clientID || null, // Si clientID está vacío o no se proporciona, se guarda como null
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const { clientID } = req.query; // Se puede filtrar por clientID desde la query string

    let payments;
    if (clientID) {
      // Obtener los pagos filtrados por clientID
      payments = await Payment.findAll({
        where: { clientID },
      });
    } else {
      // Obtener todos los pagos
      payments = await Payment.findAll();
    }

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// lista de pagos por cliente
exports.getPaymentsWithClient = async (req, res) => {
  try {
    const { clientID } = req.params;

    // Buscar al cliente por su ID
    const client = await Client.findByPk(clientID);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    // Obtener los pagos del cliente
    const payments = await Payment.findAll({
      where: { clientID },
      attributes: ["amount", "currency", "createdAt"],
      order: [["createdAt", "DESC"]], // Ordenar por fecha de creación (opcional)
    });

    // Formatear la respuesta
    const response = {
      client: client.name, // Suponiendo que el cliente tiene un campo 'name'
      payments: payments.map((payment) => ({
        amount: payment.amount,
        currency: payment.currency,
        createdAt: payment.createdAt,
      })),
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//pagos con nombres de clientes en orden
exports.getPaymentsGroupedByClient = async (req, res) => {
  try {
    // Consulta SQL para obtener pagos y los datos del cliente, con LEFT JOIN para permitir valores nulos en clientID
    const [results, metadata] = await sequelize.query(`
      SELECT 
          COALESCE(Clients.firstName, 'visitante') AS client,  -- Usamos COALESCE para asignar 'visitante' si no hay cliente
          Payments.amount,
          Payments.currency,
          Payments.createdAt
      FROM 
          Payments
      LEFT JOIN 
          Clients ON Payments.clientID = Clients.id
      ORDER BY 
          Payments.createdAt DESC;
    `);

    // Agrupar los pagos por cliente (o 'visitante' si no hay cliente)
    const groupedPayments = results.reduce((acc, payment) => {
      const clientName = payment.client;

      // Si el cliente no existe en el acumulador, crear la entrada
      if (!acc[clientName]) {
        acc[clientName] = {
          client: clientName,
          payments: [],
        };
      }

      // Agregar el pago a la lista de pagos del cliente
      acc[clientName].payments.push({
        amount: payment.amount,
        currency: payment.currency,
        createdAt: payment.createdAt,
      });

      return acc;
    }, {});

    // Convertir el objeto acumulado en un array de resultados
    const response = Object.values(groupedPayments);

    // Enviar la respuesta en el formato deseado
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, currency, clientID } = req.body;

    // Buscar el pago por su ID
    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Actualizar el pago
    await payment.update({
      amount,
      currency,
      clientID, // Se actualiza también el clientID
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
