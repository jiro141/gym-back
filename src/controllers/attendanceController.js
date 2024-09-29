// src/controllers/attendanceController.js
const Client = require("../models/client");

exports.markAttendance = async (req, res) => {
  try {
    const { idNumber } = req.params; // Extract idNumber from the request params
    const client = await Client.findOne({ where: { idNumber } }); // Find client by idNumber
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }
    client.attendance = true; // Mark attendance as true
    await client.save();
    res.status(200).json({ message: "Attendance marked", client });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
