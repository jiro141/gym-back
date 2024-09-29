'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Añadir la columna 'attendanceCounter' a la tabla 'Clients'
    await queryInterface.addColumn('Clients', 'attendanceCounter', {
      type: Sequelize.INTEGER,
      defaultValue: 0,  // Valor por defecto
      allowNull: false, // No permitir valores nulos
    });
  },

  async down(queryInterface, Sequelize) {
    // Eliminar la columna 'attendanceCounter' en caso de revertir la migración
    await queryInterface.removeColumn('Clients', 'attendanceCounter');
  }
};
