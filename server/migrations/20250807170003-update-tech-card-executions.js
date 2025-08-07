// server/migrations/20250807170003-update-tech-card-executions.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Проверяем, существует ли таблица
    const tableExists = await queryInterface.tableExists('tech_card_executions');
    
    if (!tableExists) {
      // Создаем таблицу если она не существует
      await queryInterface.createTable('tech_card_executions', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
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
        stageName: {
          type: Sequelize.STRING,
          allowNull: false
        },
        quantityProduced: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        executedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        qualityStatus: {
          type: Sequelize.ENUM('OK', 'NOK'),
          allowNull: true
        },
        qualityComment: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        checkedById: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        }
      });
    }

    // Добавляем индексы
    await queryInterface.addIndex('tech_card_executions', ['techCardId']);
    await queryInterface.addIndex('tech_card_executions', ['executedById']);
    await queryInterface.addIndex('tech_card_executions', ['executedAt']);
    await queryInterface.addIndex('tech_card_executions', ['qualityStatus']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('tech_card_executions', ['techCardId']);
    await queryInterface.removeIndex('tech_card_executions', ['executedById']);
    await queryInterface.removeIndex('tech_card_executions', ['executedAt']);
    await queryInterface.removeIndex('tech_card_executions', ['qualityStatus']);
    
    // Можно оставить таблицу или удалить - на ваше усмотрение
    // await queryInterface.dropTable('tech_card_executions');
  }
};
