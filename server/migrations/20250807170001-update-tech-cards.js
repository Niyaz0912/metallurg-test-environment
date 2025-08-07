// server/migrations/20250807170001-update-tech-cards.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('tech_cards', 'partNumber', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true
    });

    await queryInterface.addColumn('tech_cards', 'drawingUrl', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('tech_cards', 'totalUsageCount', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    });

    await queryInterface.addColumn('tech_cards', 'totalProducedQuantity', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    });

    await queryInterface.addColumn('tech_cards', 'version', {
      type: Sequelize.STRING,
      defaultValue: '1.0',
      allowNull: false
    });

    await queryInterface.addColumn('tech_cards', 'status', {
      type: Sequelize.ENUM('draft', 'active', 'archived'),
      defaultValue: 'draft',
      allowNull: false
    });

    await queryInterface.addColumn('tech_cards', 'estimatedTimePerUnit', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Время на 1 деталь в минутах'
    });

    await queryInterface.addColumn('tech_cards', 'notes', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('tech_cards', 'createdById', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Переименовываем существующее поле operationSteps в productionStages
    await queryInterface.renameColumn('tech_cards', 'operationSteps', 'productionStages');

    // Добавляем индексы
    await queryInterface.addIndex('tech_cards', ['partNumber']);
    await queryInterface.addIndex('tech_cards', ['productName']);
    await queryInterface.addIndex('tech_cards', ['status']);
    await queryInterface.addIndex('tech_cards', ['createdById']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('tech_cards', ['partNumber']);
    await queryInterface.removeIndex('tech_cards', ['productName']);
    await queryInterface.removeIndex('tech_cards', ['status']);
    await queryInterface.removeIndex('tech_cards', ['createdById']);

    await queryInterface.renameColumn('tech_cards', 'productionStages', 'operationSteps');
    
    await queryInterface.removeColumn('tech_cards', 'partNumber');
    await queryInterface.removeColumn('tech_cards', 'drawingUrl');
    await queryInterface.removeColumn('tech_cards', 'totalUsageCount');
    await queryInterface.removeColumn('tech_cards', 'totalProducedQuantity');
    await queryInterface.removeColumn('tech_cards', 'version');
    await queryInterface.removeColumn('tech_cards', 'status');
    await queryInterface.removeColumn('tech_cards', 'estimatedTimePerUnit');
    await queryInterface.removeColumn('tech_cards', 'notes');
    await queryInterface.removeColumn('tech_cards', 'createdById');
  }
};
