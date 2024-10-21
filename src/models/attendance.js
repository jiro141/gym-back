const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user'); // Asegúrate de que User está correctamente importado

const Attendance = sequelize.define('Attendance', {
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  // Nuevo campo para almacenar el hash de la publicKey (huella dactilar)
  fingerprintData: {
    type: DataTypes.STRING,
    allowNull: true // Puede ser null si se usa idNumber en lugar de huella dactilar
  }
});

module.exports = Attendance;
