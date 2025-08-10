'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tech_card_executions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      techCardId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tech_cards',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      executedById: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      quantityProduced: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Количество произведенных деталей'
      },
      setupNumber: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1,
        comment: 'Номер установки'
      },
      executedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Дата выполнения работ'
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

    // Создаем индексы
    await queryInterface.addIndex('tech_card_executions', ['techCardId']);
    await queryInterface.addIndex('tech_card_executions', ['executedById']);
    await queryInterface.addIndex('tech_card_executions', ['executedAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tech_card_executions');
  }
};
