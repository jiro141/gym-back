const Client = require("../models/client");
const Attendance = require("../models/attendance");
const { Sequelize } = require("sequelize");

exports.markAttendance = async (req, res) => {
  try {
    const { idNumber, fingerprintData } = req.body; // Recibe idNumber y fingerprintData desde el cuerpo de la solicitud

    let client;

    // Función para convertir JSON a array de valores
    const convertJsonToArray = (json) => {
      return Array.isArray(json) ? json : Object.values(json).map(value => parseFloat(value));
    };

    // Función para calcular la similitud cosenoidal entre dos descriptores
    const calculateCosineSimilarity = (descriptor1, descriptor2) => {
      const dotProduct = descriptor1.reduce((sum, value, i) => sum + value * descriptor2[i], 0);
      const magnitude1 = Math.sqrt(descriptor1.reduce((sum, value) => sum + Math.pow(value, 2), 0));
      const magnitude2 = Math.sqrt(descriptor2.reduce((sum, value) => sum + Math.pow(value, 2), 0));
      return dotProduct / (magnitude1 * magnitude2);
    };

    // Verifica si se proporcionó fingerprintData
    if (fingerprintData) {
      // Convertimos `fingerprintData` a array de valores
      const receivedDescriptor = convertJsonToArray(fingerprintData);

      // Buscar todos los clientes con fingerprintData almacenado (no null)
      const clients = await Client.findAll({
        where: {
          fingerprintData: { [Sequelize.Op.not]: null } // Selecciona donde fingerprintData no es null
        },
      });

      // Comparar el descriptor recibido con el de cada cliente usando similitud cosenoidal
      client = clients.find((c) => {
        const storedDescriptor = convertJsonToArray(c.fingerprintData); // Convertir fingerprintData almacenado a array
        const similarity = calculateCosineSimilarity(receivedDescriptor, storedDescriptor);
        return similarity > 0.6; // Umbral de similitud del 60% o más para coincidir
      });

      if (!client) {
        return res.status(404).json({ error: "Client not found by fingerprintData" });
      }
    }
    // Si no se proporciona fingerprintData, intenta buscar por idNumber
    else if (idNumber) {
      client = await Client.findOne({ where: { idNumber } });
      if (!client) {
        return res.status(404).json({ error: "Client not found by idNumber" });
      }
    }
    // Si no se proporciona ni idNumber ni fingerprintData
    else {
      return res.status(400).json({ error: "Either idNumber or fingerprintData must be provided" });
    }

    // Si se encuentra el cliente, registrar la asistencia
    const newAttendance = await Attendance.create({
      date: new Date(), // Fecha actual
      userId: client.id, // ID del cliente
      fingerprintData: fingerprintData || null, // Guardamos el descriptor si se usó la detección de rostro
    });

    // Marcar la asistencia del cliente como verdadera (si es necesario)
    client.attendance = true;
    await client.save();

    res.status(200).json({
      message: "Attendance marked successfully",
      client,
      attendance: newAttendance,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
