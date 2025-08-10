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
        onDelete: 'CASCADE',
        comment: 'ID техкарты'
      },
      executedById: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID исполнителя работ'
      },
      quantityProduced: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Количество произведенных деталей за смену'
      },
      setupNumber: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1,
        comment: 'Номер технологической установки'
      },
      executedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Дата и время выполнения работ'
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

    // Создание индексов для оптимизации запросов
    await queryInterface.addIndex('tech_card_executions', ['techCardId'], {
      name: 'idx_tech_card_executions_tech_card_id'
    });
    
    await queryInterface.addIndex('tech_card_executions', ['executedById'], {
      name: 'idx_tech_card_executions_executed_by_id'
    });
    
    await queryInterface.addIndex('tech_card_executions', ['executedAt'], {
      name: 'idx_tech_card_executions_executed_at'
    });

    // Составной индекс для быстрого поиска выполнений по техкарте и дате
    await queryInterface.addIndex('tech_card_executions', ['techCardId', 'executedAt'], {
      name: 'idx_tech_card_executions_card_date'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tech_card_executions');
  }
};
