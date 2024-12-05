const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// Define el modelo de Payment
const Payment = sequelize.define(
  "Payment",
  {
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
    // Agregamos el campo clientID como clave foránea
    clientID: {
      type: DataTypes.INTEGER,
      references: {
        model: "Clients", // Aquí referenciamos la tabla 'Clients'
        key: "id", // La columna 'id' de Clients será la clave primaria
      },
      onDelete: "CASCADE", // Elimina los pagos si se elimina un cliente
    },
  },
  {
    tableName: "Payments", // Especifica explícitamente el nombre de la tabla
  }
);

// Definir la relación entre Payment y Client (1 a N)
Payment.associate = (models) => {
  Payment.belongsTo(models.Client, { foreignKey: "clientID" });
};

module.exports = Payment;
