'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('assignments', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      operatorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      shiftDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      taskDescription: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      machineNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      detailName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      customerName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      plannedQuantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      actualQuantity: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      techCardId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('assignments');
  },
};
