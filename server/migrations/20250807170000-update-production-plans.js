// server/migrations/20250807170000-update-production-plans.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('production_plans', 'completedQuantity', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    });

    await queryInterface.addColumn('production_plans', 'status', {
      type: Sequelize.ENUM('planned', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'planned',
      allowNull: false
    });

    await queryInterface.addColumn('production_plans', 'techCardId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'tech_cards',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('production_plans', 'priority', {
      type: Sequelize.INTEGER,
      defaultValue: 1,
      allowNull: false
    });

    await queryInterface.addColumn('production_plans', 'notes', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // Добавляем индексы
    await queryInterface.addIndex('production_plans', ['status']);
    await queryInterface.addIndex('production_plans', ['techCardId']);
    await queryInterface.addIndex('production_plans', ['deadline']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('production_plans', ['status']);
    await queryInterface.removeIndex('production_plans', ['techCardId']);
    await queryInterface.removeIndex('production_plans', ['deadline']);
    
    await queryInterface.removeColumn('production_plans', 'completedQuantity');
    await queryInterface.removeColumn('production_plans', 'status');
    await queryInterface.removeColumn('production_plans', 'techCardId');
    await queryInterface.removeColumn('production_plans', 'priority');
    await queryInterface.removeColumn('production_plans', 'notes');
  }
};
