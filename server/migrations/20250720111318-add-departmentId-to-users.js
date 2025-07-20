'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'departmentId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Departments',
        key: 'id'
      }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('Users', 'departmentId');
  }
};
