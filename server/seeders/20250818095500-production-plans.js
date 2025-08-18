'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('production_plans', [
      {
        id: 1,
        customerName: 'ООО Заказчик 1',
        orderName:    'ORD-001',
        quantity:     100,
        completedQuantity: 0,
        progressPercent:   0,                // будет пересчитан хуком
        deadline:     new Date(new Date().setMonth(new Date().getMonth() + 1)),
        status:       'planned',
        techCardId:   1,                     // ORD-001 из сидера tech_cards
        priority:     1,
        notes:        'Первый производственный план',
        createdAt:    new Date(),
        updatedAt:    new Date()
      },
      {
        id: 2,
        customerName: 'АО Промышленность',
        orderName:    'ORD-002',
        quantity:     50,
        completedQuantity: 10,
        progressPercent:   20,
        deadline:     new Date(new Date().setDate(new Date().getDate() + 30)),
        status:       'in_progress',
        techCardId:   2,
        priority:     2,
        notes:        null,
        createdAt:    new Date(),
        updatedAt:    new Date()
      },
      {
        id: 3,
        customerName: 'ЗАО Металлургия',
        orderName:    'ORD-003',
        quantity:     200,
        completedQuantity: 200,
        progressPercent:   100,
        deadline:     new Date(new Date().setDate(new Date().getDate() - 10)),
        status:       'completed',
        techCardId:   3,
        priority:     3,
        notes:        'Завершённый заказ',
        createdAt:    new Date(),
        updatedAt:    new Date()
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('production_plans', {
      orderName: ['ORD-001', 'ORD-002', 'ORD-003']
    });
  }
};
