const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Payment = sequelize.define("Payment", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  currency: {
    type: DataTypes.ENUM("pesos", "dolares"),
    allowNull: false,
  },
}, {
  tableName: "Payments" // Especifica explícitamente el nombre de la tabla
});

module.exports = Payment;
