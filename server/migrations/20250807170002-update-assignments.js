// server/migrations/20250807170002-update-assignments.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Добавляем новое поле productionPlanId
    await queryInterface.addColumn('assignments', 'productionPlanId', {
      type: Sequelize.INTEGER,
      allowNull: true, // Временно nullable для существующих записей
      references: {
        model: 'production_plans',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // Обновляем ENUM для status с новыми значениями
    await queryInterface.changeColumn('assignments', 'status', {
      type: Sequelize.ENUM('assigned', 'in_progress', 'completed', 'quality_check'),
      allowNull: false,
      defaultValue: 'assigned'
    });

    // Добавляем новые поля для времени
    await queryInterface.addColumn('assignments', 'startedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('assignments', 'completedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('assignments', 'notes', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // Удаляем дублированные поля (они теперь берутся из ProductionPlan)
    // ВНИМАНИЕ: Эти поля будут потеряны! Сделайте резервную копию если нужно
    await queryInterface.removeColumn('assignments', 'detailName');
    await queryInterface.removeColumn('assignments', 'customerName');

    // Добавляем индексы
    await queryInterface.addIndex('assignments', ['productionPlanId']);
    await queryInterface.addIndex('assignments', ['status']);

    // После добавления всех записей с productionPlanId, делаем поле обязательным
    // (Это нужно будет сделать в отдельном скрипте после заполнения данных)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('assignments', ['productionPlanId']);
    await queryInterface.removeIndex('assignments', ['status']);

    // Возвращаем удаленные поля
    await queryInterface.addColumn('assignments', 'detailName', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Не указано'
    });

    await queryInterface.addColumn('assignments', 'customerName', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Не указан'
    });

    // Убираем новые поля
    await queryInterface.removeColumn('assignments', 'productionPlanId');
    await queryInterface.removeColumn('assignments', 'startedAt');
    await queryInterface.removeColumn('assignments', 'completedAt');
    await queryInterface.removeColumn('assignments', 'notes');

    // Возвращаем старый ENUM для status
    await queryInterface.changeColumn('assignments', 'status', {
      type: Sequelize.ENUM('assigned', 'completed'),
      allowNull: false,
      defaultValue: 'assigned'
    });
  }
};
