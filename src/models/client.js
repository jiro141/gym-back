// src/models/client.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

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
  },
  expirationDate: {
    type: DataTypes.DATE,
    allowNull: true, // Permitir valores nulos para manejar membresías permanentes
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
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
  attendance: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

Client.beforeCreate((client) => {
  const today = new Date();
  client.registrationDate = today;

  switch (client.membershipType) {
    case "semanal":
      client.expirationDate = new Date(
        today.getTime() + 7 * 24 * 60 * 60 * 1000
      ); // Añadir 7 días
      break;
    case "mensual":
      client.expirationDate = new Date(today.setMonth(today.getMonth() + 1)); // Añadir 1 mes
      break;
    case "permanente":
      client.expirationDate = null; // No hay fecha de vencimiento para membresías permanentes
      client.isActive = true;
      client.isExpired = false;
      break;
    default:
      throw new Error("Invalid membership type");
  }

  if (client.membershipType !== "permanente") {
    client.isExpired = client.expirationDate < today;
    client.isActive = !client.isExpired;
  }
});

Client.beforeUpdate((client) => {
  if (client.renewalDate || client.expirationDate) {
    const today = new Date();

    if (client.expirationDate) {
      client.isExpired = client.expirationDate < today;
      client.isActive = !client.isExpired;
    }

    switch (client.membershipType) {
      case "semanal":
        client.expirationDate = new Date(
          today.getTime() + 7 * 24 * 60 * 60 * 1000
        ); // Añadir 7 días
        break;
      case "mensual":
        client.expirationDate = new Date(today.setMonth(today.getMonth() + 1)); // Añadir 1 mes
        break;
      case "permanente":
        client.expirationDate = null; // No hay fecha de vencimiento para membresías permanentes
        client.isActive = true;
        client.isExpired = false;
        break;
    }

    if (client.membershipType !== "permanente") {
      const timeDifference = client.expirationDate.getTime() - today.getTime();
      const daysDifference = timeDifference / (1000 * 3600 * 24);
      client.loyaltyPercentage = Math.max(
        0,
        Math.min(100, (daysDifference / 30) * 100)
      );

      client.isExpired = client.expirationDate < today;
      client.isActive = !client.isExpired;
    }
  }
});

module.exports = Client;
