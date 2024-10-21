const Client = require("../models/client");
const Attendance = require("../models/attendance");
const crypto = require('crypto'); // Usamos crypto para generar el hash de la publicKey

exports.markAttendance = async (req, res) => {
  try {
    const { idNumber, fingerprintData } = req.body; // Recibe idNumber y fingerprintData desde el cuerpo de la solicitud

    let client;

    // Si se proporciona fingerprintData, intentar encontrar al cliente por el rawId o id
    if (fingerprintData && (fingerprintData.rawId || fingerprintData.id)) {
      const receivedRawId = fingerprintData.rawId || fingerprintData.id; // Usa rawId o id del fingerprintData
      const receivedPublicKeyHash = hashPublicKey(fingerprintData.publicKey); // Hasheamos la publicKey

      // Buscar al cliente usando el rawId o id del dispositivo biométrico
      client = await Client.findOne({
        where: {
          fingerprintRawId: receivedRawId
        }
      });

      // Si el cliente no es encontrado por rawId, podemos intentar por el hash de la publicKey como respaldo
      if (!client) {
        client = await Client.findOne({
          where: {
            fingerprintPublicKey: receivedPublicKeyHash
          }
        });
      }

      if (!client) {
        return res.status(404).json({ error: "Client not found by fingerprint" });
      }
    }
    // Si se proporciona el idNumber, buscar al cliente por el número de identificación
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
      fingerprintData: fingerprintData ? hashPublicKey(fingerprintData.publicKey) : null, // Guardamos el hash si se usó la huella
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

// Función para generar el hash de la publicKey
const hashPublicKey = (publicKey) => {
  return crypto.createHash('sha256').update(publicKey).digest('hex');
};
