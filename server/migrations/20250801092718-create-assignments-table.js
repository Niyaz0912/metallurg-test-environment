'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('assignments', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      operatorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      shiftDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      shiftType: {
        type: Sequelize.ENUM('day', 'night'),
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
        references: { model: 'tech_cards', key: 'id' }, // скорректируйте название, если таблица называется иначе
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM('assigned', 'completed'),
        allowNull: false,
        defaultValue: 'assigned',
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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('assignments');
  },
};
