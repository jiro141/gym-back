const Client = require("../models/client");
const Attendance = require("../models/attendance"); // Importa el modelo Attendance ya definido
const { Sequelize } = require("sequelize");
const faceapi = require("face-api.js");
const canvas = require("canvas");
const path = require("path");
const { log } = require("console");

// Integración de `canvas` con `face-api.js` para su uso en Node.js
faceapi.env.monkeyPatch({
  Canvas: canvas.Canvas,
  Image: canvas.Image,
  ImageData: canvas.ImageData,
});

// Función para convertir descriptor array a JSON
function descriptorToJson(descriptorArray) {
  return descriptorArray.reduce((json, value, index) => {
    json[index] = value;
    return json;
  }, {});
}

// Función para convertir JSON a Float32Array (para que sea compatible con LabeledFaceDescriptors)
function jsonToDescriptor(json) {
  const values = Object.values(json).map((value) => parseFloat(value));
  return new Float32Array(values); // Convertimos a Float32Array
}

// Cargar imágenes etiquetadas y crear descriptores en JSON
async function loadLabeledImages() {
  const clients = await Client.findAll({
    where: {
      fingerprintData: { [Sequelize.Op.not]: null },
    },
  });

  return Promise.all(
    clients.map(async (client) => {
      try {
        if (!client.fingerprintData) {
          console.warn(
            `El cliente ${client.idNumber} no tiene fingerprintData válido.`
          );
          return null;
        }

        // Intentar parsear fingerprintData como JSON y convertir a Float32Array
        let storedDescriptor;
        try {
          const parsedData = JSON.parse(client.fingerprintData);

          // Verifica que el JSON parseado sea un objeto válido
          if (typeof parsedData === "object" && parsedData !== null) {
            // Convierte el JSON a un arreglo de punto flotante
            storedDescriptor = jsonToDescriptor(parsedData);
          } else {
            console.error(
              `fingerprintData para el cliente ${client.idNumber} no es un JSON válido.`
            );
            return null;
          }
        } catch (error) {
          console.error(
            `Error al parsear fingerprintData para el cliente ${client.idNumber}:`,
            error
          );
          return null;
        }

        // Verificamos que el descriptor sea un Float32Array válido y tenga la longitud correcta (128)
        if (
          !(storedDescriptor instanceof Float32Array) ||
          storedDescriptor.length !== 128
        ) {
          console.error(
            `El descriptor para el cliente ${client.idNumber} no es un Float32Array válido o no tiene la longitud correcta.`
          );
          return null;
        }

        return new faceapi.LabeledFaceDescriptors(client.idNumber, [
          storedDescriptor,
        ]);
      } catch (error) {
        console.error(
          `Error al procesar fingerprintData para el cliente ${client.idNumber}:`,
          error
        );
        return null;
      }
    })
  ).then((results) => results.filter((result) => result !== null)); // Filtra descriptores válidos
}

// Función para cargar los descriptores y realizar la comparación en tiempo real
exports.markAttendance = async (req, res) => {
  try {
    const { idNumber, fingerprintData = null } = req.body;
    let client;
    console.log(client, "datos");

    // Verifica si se proporcionó fingerprintData para reconocimiento facial
    if (fingerprintData) {
      console.log(
        "fingerprintData recibido para comparación:",
        fingerprintData
      );

      // Cargar descriptores de imágenes etiquetadas
      const labeledDescriptors = await loadLabeledImages();

      // Verificar que se hayan cargado descriptores válidos
      if (!labeledDescriptors || labeledDescriptors.length === 0) {
        return res
          .status(500)
          .json({ error: "No labeled descriptors found for comparison" });
      }

      const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.7);

      // Validar que fingerprintData es un array con la longitud adecuada (suponiendo 128)
      if (!Array.isArray(fingerprintData) || fingerprintData.length !== 128) {
        return res
          .status(400)
          .json({ error: "Invalid fingerprintData format or length" });
      }

      // Convertimos fingerprintData a JSON si es necesario
      const receivedDescriptorJson = Array.isArray(fingerprintData)
        ? descriptorToJson(fingerprintData)
        : fingerprintData;

      // Convertir el JSON de entrada a un Float32Array para la comparación
      const bestMatch = faceMatcher.findBestMatch(
        jsonToDescriptor(receivedDescriptorJson)
      );

      console.log("Mejor coincidencia:", bestMatch.toString());

      if (bestMatch.label !== "unknown") {
        client = await Client.findOne({ where: { idNumber: bestMatch.label } });
        console.log(
          "Cliente encontrado por comparación de fingerprintData:",
          client ? client.idNumber : null
        );
      }

      if (!client) {
        return res
          .status(404)
          .json({ error: "Client not recognized by fingerprintData" });
      }
    } else if (idNumber) {
      client = await Client.findOne({ where: { idNumber } });
      console.log(
        "Cliente encontrado por idNumber:",
        client ? client.idNumber : null
      );

      if (!client) {
        return res.status(404).json({ error: "Client not found by idNumber" });
      }
    } else {
      return res
        .status(400)
        .json({ error: "Either idNumber or fingerprintData must be provided" });
    }

    // Si se encuentra el cliente, registrar la asistencia
    const newAttendance = await Attendance.create({
      date: new Date(),
      userId: client.id, // userId debe coincidir con un ID válido en Clients
    });

    client.attendance = true;
    await client.save();

    res.status(200).json({
      message: "Attendance marked successfully",
      client,
      attendance: newAttendance,
    });
  } catch (error) {
    console.error("Error en markAttendance:", error);
    res.status(500).json({ error: error.toString() });
  }
};
