// server/migrations/20250807170004-populate-production-plan-ids.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Этот скрипт нужен для заполнения productionPlanId в существующих записях assignments
    // Поскольку мы удалили detailName и customerName, нужно создать производственные планы
    // на основе существующих assignments
    
    const [assignments] = await queryInterface.sequelize.query(`
      SELECT DISTINCT "detailName", "customerName", "techCardId" 
      FROM assignments 
      WHERE "productionPlanId" IS NULL
    `);

    for (const assignment of assignments) {
      // Создаем производственный план для каждой уникальной комбинации
      const [result] = await queryInterface.sequelize.query(`
        INSERT INTO production_plans ("customerName", "orderName", "quantity", "deadline", "techCardId", "createdAt", "updatedAt")
        VALUES (:customerName, :orderName, 1, :deadline, :techCardId, NOW(), NOW())
        RETURNING id
      `, {
        replacements: {
          customerName: assignment.customerName || 'Не указан',
          orderName: assignment.detailName || 'Не указано',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 дней
          techCardId: assignment.techCardId
        }
      });

      const productionPlanId = result[0].id;

      // Обновляем все assignments с такой же комбинацией
      await queryInterface.sequelize.query(`
        UPDATE assignments 
        SET "productionPlanId" = :productionPlanId
        WHERE "detailName" = :detailName 
          AND "customerName" = :customerName 
          AND "techCardId" = :techCardId
          AND "productionPlanId" IS NULL
      `, {
        replacements: {
          productionPlanId,
          detailName: assignment.detailName,
          customerName: assignment.customerName,
          techCardId: assignment.techCardId
        }
      });
    }

    // Теперь делаем productionPlanId обязательным
    await queryInterface.changeColumn('assignments', 'productionPlanId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'production_plans',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('assignments', 'productionPlanId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'production_plans',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  }
};
