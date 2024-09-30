// src/models/client.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Payment = require("./payment"); // Asegurarse de importar Payment

const Client = sequelize.define("Client", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  idNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  registrationDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  renewalDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  expirationDate: {
    type: DataTypes.DATE,
    allowNull: true, // Permitir valores nulos para manejar membresías permanentes
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // Indica asistencia diaria
  },
  isExpired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  membershipType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  loyaltyPercentage: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0,
  },
  attendanceCounter: {
    // Contador de asistencia mensual
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  attendance: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

// Relación con el modelo Payment
Client.hasMany(Payment, { foreignKey: "clientId", as: "payments" });
Payment.belongsTo(Client, { foreignKey: "clientId" });

// Función para actualizar el estado de la membresía
// function updateMembershipStatus(client) {
//   const today = new Date();

//   // Si la membresía es permanente
//   if (client.membershipType === "permanente") {
//     client.expirationDate = null;
//     client.isActive = true;
//     client.isExpired = false;
//   } else {
//     // Calcular la fecha de vencimiento según el tipo de membresía
//     if (!client.renewalDate) {
//       client.renewalDate = today;
//     }

//     switch (client.membershipType) {
//       case "semanal":
//         client.expirationDate = new Date(
//           client.renewalDate.getTime() + 7 * 24 * 60 * 60 * 1000
//         ); // Añadir 7 días
//         break;
//       case "mensual":
//         const newDate = new Date(client.renewalDate);
//         client.expirationDate = new Date(
//           newDate.setMonth(newDate.getMonth() + 1)
//         ); // Añadir 1 mes
//         break;
//     }

//     // Actualizar el estado basado en la fecha de vencimiento
//     if (client.expirationDate) {
//       client.isExpired = client.expirationDate < today;
//       client.isActive = !client.isExpired;
//     }

//     // Calcular el porcentaje de lealtad basado en la fecha de vencimiento
//     if (client.expirationDate && !client.isExpired) {
//       const timeDifference = client.expirationDate.getTime() - today.getTime();
//       const daysDifference = timeDifference / (1000 * 3600 * 24); // Diferencia en días
//       client.loyaltyPercentage = Math.max(
//         0,
//         Math.min(100, (daysDifference / 30) * 100)
//       );
//     } else {
//       client.loyaltyPercentage = 0;
//     }
//   }
// }

// // Hooks para actualizar el estado de la membresía antes de crear y actualizar
// Client.beforeCreate((client) => {
//   updateMembershipStatus(client);
// });

// Client.beforeUpdate((client) => {
//   updateMembershipStatus(client);
// });

module.exports = Client;
