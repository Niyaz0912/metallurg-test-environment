'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Assignments', [
      {
        title: 'Изготовление детали №001',
        description: 'Точение детали корпуса по техкарте ТК-001',
        assignedTo: 3, // ID оператора
        techCardId: 1,
        productionPlanId: 1,
        status: 'pending',
        priority: 'medium',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Контроль качества детали №002', 
        description: 'Проверка размеров и чистоты поверхности',
        assignedTo: 3,
        techCardId: 1,
        productionPlanId: 1,
        status: 'in_progress',
        priority: 'high',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Assignments', null, {});
  }
};
