// src/controllers/clientController.js
const { Op } = require('sequelize');
const Client = require("../models/client");

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
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.findAll({
      attributes: [
        "id",
        "firstName",
        "lastName",
        "createdAt",
        "expirationDate",
        "isActive",
        "attendance",
      ],
    });
    res.status(200).json(clients);
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
        { idNumber: { [Op.like]: `%${search}%` } }
      ]
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

    res.status(200).json(clients);
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
