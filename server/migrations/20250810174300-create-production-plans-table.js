'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('production_plans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Название плана производства'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Описание плана'
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Дата начала'
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Дата окончания'
      },
      status: {
        type: Sequelize.ENUM('draft', 'active', 'completed', 'cancelled'),
        defaultValue: 'draft',
        allowNull: false,
        comment: 'Статус плана'
      },
      createdById: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'ID создателя плана'
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

    // Создание индексов для оптимизации
    await queryInterface.addIndex('production_plans', ['status']);
    await queryInterface.addIndex('production_plans', ['createdById']);
    await queryInterface.addIndex('production_plans', ['startDate']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('production_plans');
  }
};

