'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('production_plans', [  // Правильное название с подчеркиванием!
      {
        id: 1,
        name: 'Производство корпусных деталей',
        description: 'План производства корпусных деталей для конвейерного оборудования',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        status: 'active',
        customerName: 'ООО Транспортные системы',
        orderName: 'Заказ №2024-001',
        quantity: 100,
        completedQuantity: 25,
        progressPercent: 25.00,
        deadline: new Date('2024-01-30'),
        priority: 'high',
        notes: 'Срочный заказ, требует особого контроля качества'
      },
      {
        id: 2,
        name: 'Изготовление подшипниковых узлов',
        description: 'План производства подшипниковых узлов для роликовых конвейеров',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-28'),
        status: 'draft',
        customerName: 'АО Машиностроение',
        orderName: 'Заказ №2024-002',
        quantity: 50,
        completedQuantity: 0,
        progressPercent: 0.00,
        deadline: new Date('2024-02-25'),
        priority: 'medium',
        notes: 'Стандартный план производства'
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('production_plans', null, {});
  }
};
