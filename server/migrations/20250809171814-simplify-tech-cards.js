'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      
      // ========== 1. УПРОЩЕНИЕ ТАБЛИЦЫ tech_cards ==========
      
      // Добавляем новые поля
      await queryInterface.addColumn('tech_cards', 'customer', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Не указан', // временно для существующих записей
        comment: 'Заказчик'
      }, { transaction });

      await queryInterface.addColumn('tech_cards', 'order', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Не указан', // временно для существующих записей
        comment: 'Номер заказа'
      }, { transaction });

      await queryInterface.addColumn('tech_cards', 'quantity', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0, // временно для существующих записей
        comment: 'Общее количество в заказе'
      }, { transaction });

      // Переименовываем drawingUrl в pdfUrl
      await queryInterface.renameColumn('tech_cards', 'drawingUrl', 'pdfUrl', { transaction });

      // Удаляем ненужные сложные поля
      await queryInterface.removeColumn('tech_cards', 'specifications', { transaction });
      await queryInterface.removeColumn('tech_cards', 'productionStages', { transaction });
      await queryInterface.removeColumn('tech_cards', 'estimatedTimePerUnit', { transaction });
      await queryInterface.removeColumn('tech_cards', 'totalUsageCount', { transaction });
      await queryInterface.removeColumn('tech_cards', 'notes', { transaction });
      await queryInterface.removeColumn('tech_cards', 'version', { transaction });
      
      // Оставляем description как опциональное поле
      await queryInterface.changeColumn('tech_cards', 'description', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Краткое описание (опционально)'
      }, { transaction });

      // ========== 2. СОЗДАНИЕ ТАБЛИЦЫ tech_card_accesses ==========
      
      await queryInterface.createTable('tech_card_accesses', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        techCardId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'tech_cards',
            key: 'id'
          },
          onDelete: 'CASCADE',
          comment: 'ID техкарты'
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          },
          onDelete: 'CASCADE',
          comment: 'ID пользователя'
        },
        accessedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
          comment: 'Время доступа к техкарте'
        },
        action: {
          type: Sequelize.ENUM('view', 'work'),
          allowNull: false,
          defaultValue: 'view',
          comment: 'view = просмотр, work = выполнение работы'
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
      }, { transaction });

      // Добавляем индексы для производительности
      await queryInterface.addIndex('tech_card_accesses', ['techCardId'], { transaction });
      await queryInterface.addIndex('tech_card_accesses', ['userId'], { transaction });
      await queryInterface.addIndex('tech_card_accesses', ['accessedAt'], { transaction });

      // ========== 3. УПРОЩЕНИЕ ТАБЛИЦЫ tech_card_executions ==========
      
      // Добавляем поле номера установки
      await queryInterface.addColumn('tech_card_executions', 'setupNumber', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1,
        comment: 'Номер установки (1, 2, 3 и т.д.)'
      }, { transaction });

      // Удаляем сложные поля из executions
      try {
        await queryInterface.removeColumn('tech_card_executions', 'stageName', { transaction });
      } catch (e) {
        console.log('Column stageName does not exist or already removed');
      }

      try {
        await queryInterface.removeColumn('tech_card_executions', 'qualityStatus', { transaction });
      } catch (e) {
        console.log('Column qualityStatus does not exist or already removed');
      }

      try {
        await queryInterface.removeColumn('tech_card_executions', 'qualityComment', { transaction });
      } catch (e) {
        console.log('Column qualityComment does not exist or already removed');
      }

      try {
        await queryInterface.removeColumn('tech_card_executions', 'checkedById', { transaction });
      } catch (e) {
        console.log('Column checkedById does not exist or already removed');
      }

      // Обновляем комментарии к существующим полям
      await queryInterface.changeColumn('tech_card_executions', 'quantityProduced', {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Количество произведенных деталей'
      }, { transaction });

      await queryInterface.changeColumn('tech_card_executions', 'executedAt', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: 'Время выполнения работы'
      }, { transaction });
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      
      // ========== ОТКАТ 3. Восстановление tech_card_executions ==========
      
      // Удаляем добавленное поле
      await queryInterface.removeColumn('tech_card_executions', 'setupNumber', { transaction });

      // Восстанавливаем удаленные поля (с базовыми типами)
      await queryInterface.addColumn('tech_card_executions', 'stageName', {
        type: Sequelize.STRING,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('tech_card_executions', 'qualityStatus', {
        type: Sequelize.ENUM('OK', 'NOK'),
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('tech_card_executions', 'qualityComment', {
        type: Sequelize.TEXT,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('tech_card_executions', 'checkedById', {
        type: Sequelize.INTEGER,
        allowNull: true
      }, { transaction });

      // ========== ОТКАТ 2. Удаление tech_card_accesses ==========
      
      await queryInterface.dropTable('tech_card_accesses', { transaction });

      // ========== ОТКАТ 1. Восстановление tech_cards ==========
      
      // Переименовываем обратно
      await queryInterface.renameColumn('tech_cards', 'pdfUrl', 'drawingUrl', { transaction });

      // Удаляем добавленные поля
      await queryInterface.removeColumn('tech_cards', 'customer', { transaction });
      await queryInterface.removeColumn('tech_cards', 'order', { transaction });
      await queryInterface.removeColumn('tech_cards', 'quantity', { transaction });

      // Восстанавливаем удаленные поля (с базовыми значениями)
      await queryInterface.addColumn('tech_cards', 'specifications', {
        type: Sequelize.JSON,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('tech_cards', 'productionStages', {
        type: Sequelize.JSON,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('tech_cards', 'estimatedTimePerUnit', {
        type: Sequelize.INTEGER,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('tech_cards', 'totalUsageCount', {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }, { transaction });

      await queryInterface.addColumn('tech_cards', 'notes', {
        type: Sequelize.TEXT,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('tech_cards', 'version', {
        type: Sequelize.STRING,
        defaultValue: '1.0'
      }, { transaction });
    });
  }
};

