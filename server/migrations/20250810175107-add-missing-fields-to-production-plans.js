'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Добавляем недостающие поля
    await queryInterface.addColumn('production_plans', 'customerName', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Название заказчика'
    });
    
    await queryInterface.addColumn('production_plans', 'orderName', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Название заказа'
    });
    
    await queryInterface.addColumn('production_plans', 'quantity', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Общее количество для производства'
    });
    
    await queryInterface.addColumn('production_plans', 'completedQuantity', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Выполненное количество'
    });
    
    await queryInterface.addColumn('production_plans', 'progressPercent', {
      type: Sequelize.DECIMAL(5,2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Процент выполнения'
    });
    
    await queryInterface.addColumn('production_plans', 'deadline', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Крайний срок выполнения'
    });
    
    await queryInterface.addColumn('production_plans', 'techCardId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'tech_cards',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Связанная техкарта'
    });
    
    await queryInterface.addColumn('production_plans', 'priority', {
      type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: true,
      defaultValue: 'medium',
      comment: 'Приоритет плана'
    });
    
    await queryInterface.addColumn('production_plans', 'notes', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Дополнительные заметки'
    });

    // Создание индексов
    await queryInterface.addIndex('production_plans', ['customerName']);
    await queryInterface.addIndex('production_plans', ['techCardId']);
    await queryInterface.addIndex('production_plans', ['priority']);
    await queryInterface.addIndex('production_plans', ['deadline']);
  },

  down: async (queryInterface, Sequelize) => {
    // Удаляем добавленные поля
    await queryInterface.removeColumn('production_plans', 'customerName');
    await queryInterface.removeColumn('production_plans', 'orderName');
    await queryInterface.removeColumn('production_plans', 'quantity');
    await queryInterface.removeColumn('production_plans', 'completedQuantity');
    await queryInterface.removeColumn('production_plans', 'progressPercent');
    await queryInterface.removeColumn('production_plans', 'deadline');
    await queryInterface.removeColumn('production_plans', 'techCardId');
    await queryInterface.removeColumn('production_plans', 'priority');
    await queryInterface.removeColumn('production_plans', 'notes');
  }
};

