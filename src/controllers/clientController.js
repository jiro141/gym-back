// src/controllers/clientController.js
const { Op } = require("sequelize");
const Client = require("../models/client");

// Función para recalcular el estado de la membresía
function recalculateMembershipStatus(client) {
  const today = new Date();
  if (client.membershipType === "permanente") {
    client.isActive = true;
    client.isExpired = false;
  } else if (client.expirationDate < today) {
    client.isExpired = true;
    // client.isActive = !client.isExpired;
  }

  return client;
}
function recalculateLoyalty(client) {
  const today = new Date();
  let weeklyAttendance = client.attendanceCounter / 4; // Número de semanas con al menos 4 días de asistencia
  let loyaltyBonus = 0;

  // Calcular el porcentaje de lealtad en función de la membresía
  if (client.membershipType === "mensual") {
    loyaltyBonus = 10; // Bonificación más alta para membresía mensual
  } else if (client.membershipType === "semanal") {
    loyaltyBonus = 5; // Bonificación para membresía semanal
  }

  // Calcular crecimiento del porcentaje de lealtad basado en la asistencia
  if (weeklyAttendance >= 4 && weeklyAttendance <= 6) {
    client.loyaltyPercentage += weeklyAttendance * loyaltyBonus; // Incrementar basado en asistencia semanal
  }

  // Si la membresía ha expirado pero se renueva dentro de los primeros 3 días
  if (
    client.isExpired &&
    today - client.expirationDate <= 3 * 24 * 60 * 60 * 1000
  ) {
    client.loyaltyPercentage += 5; // Pequeña bonificación por renovar a tiempo
  } else if (client.isExpired) {
    client.loyaltyPercentage += 2; // Bonificación más pequeña si renueva después de los 3 días
  }

  // Restringir el porcentaje de lealtad a 100%
  client.loyaltyPercentage = Math.min(100, client.loyaltyPercentage);

  return client;
}

exports.createClient = async (req, res) => {
  try {
    const client = await Client.create(req.body);
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }
    await client.update(req.body);

    // Recalcular el estado de membresía después de la actualización
    recalculateMembershipStatus(client);

    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// src/controllers/clientController.js

// Función para recalcular la fecha de vencimiento según la fecha de renovación y el tipo de membresía
function recalculateExpirationDate(client) {
  const today = new Date();

  // Calcular la nueva fecha de expiración basada en la membresía
  if (client.membershipType === "semanal") {
    client.expirationDate = new Date(
      client.renewalDate.getTime() + 7 * 24 * 60 * 60 * 1000
    ); // Añadir 7 días
  } else if (client.membershipType === "mensual") {
    const newDate = new Date(client.renewalDate);
    client.expirationDate = new Date(newDate.setMonth(newDate.getMonth() + 1)); // Añadir 1 mes
  }

  // Actualizar el estado de vencimiento
  client.isExpired = client.expirationDate < today;
  client.isActive = !client.isExpired;

  return client;
}

exports.renewMembership = async (req, res) => {
  try {
    const { id } = req.params;
    const { renewalDate, membershipType } = req.body; // Recibir también el tipo de membresía

    // Buscar el cliente
    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    // Actualizar la fecha de renovación
    client.renewalDate = new Date(renewalDate);

    // Actualizar el tipo de membresía, si se proporciona
    if (membershipType) {
      client.membershipType = membershipType;
    }

    // Recalcular la fecha de expiración con el nuevo tipo de membresía
    recalculateExpirationDate(client);

    // Guardar los cambios en la base de datos
    await client.save();

    // Recalcular el estado de membresía después de la actualización
    recalculateMembershipStatus(client);

    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getClient = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findByPk(id);

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    // Recalcular el porcentaje de lealtad
    recalculateExpirationDate(client);

    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.findAll();

    // Recalcular el estado de membresía y porcentaje de lealtad para todos los clientes
    const updatedClients = clients.map((client) =>
      recalculateExpirationDate(client)
    );

    res.status(200).json(updatedClients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.searchClients = async (req, res) => {
  try {
    const { search } = req.query;
    const whereClause = {
      [Op.or]: [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { idNumber: { [Op.like]: `%${search}%` } },
      ],
    };

    const clients = await Client.findAll({
      where: whereClause,
      attributes: [
        "id",
        "firstName",
        "lastName",
        "idNumber",
        "createdAt",
        "expirationDate",
        "isActive",
        "attendance",
      ],
    });

    if (clients.length === 0) {
      return res.status(404).json({ error: "No clients found" });
    }

    // Recalcular el estado de membresía para los resultados encontrados
    const updatedClients = clients.map((client) =>
      recalculateMembershipStatus(client)
    );

    res.status(200).json(updatedClients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }
    await client.destroy();
    res.status(200).json({ message: "Client deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
