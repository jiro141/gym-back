// src/controllers/attendanceController.js
const Client = require('../models/client');

exports.markAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    client.attendance = true;
    await client.save();
    res.status(200).json({ message: 'Attendance marked', client });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
