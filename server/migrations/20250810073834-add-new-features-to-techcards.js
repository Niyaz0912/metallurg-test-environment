'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        // Добавляем поле для приоритета
        queryInterface.addColumn('tech_cards', 'priority', {
          type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
          defaultValue: 'medium',
          allowNull: false
        }, { transaction }),
        
        // Добавляем плановую дату завершения
        queryInterface.addColumn('tech_cards', 'plannedEndDate', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Плановая дата завершения производства'
        }, { transaction }),
        
        // Добавляем фактическую дату завершения
        queryInterface.addColumn('tech_cards', 'actualEndDate', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Фактическая дата завершения'
        }, { transaction }),
        
        // Добавляем поле для заметок
        queryInterface.addColumn('tech_cards', 'notes', {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Дополнительные заметки по техкарте'
        }, { transaction }),
        
        // Добавляем размер файла PDF
        queryInterface.addColumn('tech_cards', 'pdfFileSize', {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: 'Размер PDF файла в байтах'
        }, { transaction })
      ]);
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await Promise.all([
        queryInterface.removeColumn('tech_cards', 'priority', { transaction }),
        queryInterface.removeColumn('tech_cards', 'plannedEndDate', { transaction }),
        queryInterface.removeColumn('tech_cards', 'actualEndDate', { transaction }),
        queryInterface.removeColumn('tech_cards', 'notes', { transaction }),
        queryInterface.removeColumn('tech_cards', 'pdfFileSize', { transaction })
      ]);
    });
  }
};

