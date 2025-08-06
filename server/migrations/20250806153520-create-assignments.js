// migrations/[timestamp]-create-assignments.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('assignments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      operatorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      shiftDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      shiftType: {
        type: Sequelize.ENUM('day', 'night'),
        allowNull: false,
        defaultValue: 'day'
      },
      taskDescription: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      machineNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      detailName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      customerName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      plannedQuantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      actualQuantity: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      techCardId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        references: {
          model: 'tech_cards',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      status: {
        type: Sequelize.ENUM('assigned', 'completed'),
        allowNull: false,
        defaultValue: 'assigned'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('assignments');
  }
};

