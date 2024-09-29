// src/models/payment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Client = require('./client');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  paymentDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  paymentType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nextPaymentDue: {
    type: DataTypes.DATE,
    allowNull: true
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Client,
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
});

module.exports = Payment;
