'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('production_plans', [
      {
        id: 1,
        orderName: 'MS-2023-001',
        customerName: 'ООО "МеталлСтрой"',
        quantity: 500,
        deadline: new Date('2025-07-10T00:00:00'),
        progressPercent: 0,
        createdAt: new Date('2025-05-14T01:21:15.882Z'),
        updatedAt: new Date('2025-06-22T20:13:23.913Z')
      },
      {
        id: 2,
        orderName: 'PT-2024-005',
        customerName: 'АО "ПромТех"',
        quantity: 300,
        deadline: new Date('2025-07-24T00:00:00'),
        progressPercent: 0,
        createdAt: new Date('2025-05-14T01:21:15.882Z'),
        updatedAt: new Date('2025-06-22T20:13:01.943Z')
      },
      {
        id: 3,
        orderName: 'SM-2025-011',
        customerName: 'ООО "СибМеталл"',
        quantity: 150,
        deadline: new Date('2025-07-03T00:00:00'),
        progressPercent: 0,
        createdAt: new Date('2025-05-14T01:21:15.882Z'),
        updatedAt: new Date('2025-06-22T20:12:44.903Z')
      },
      {
        id: 4,
        orderName: 'US-2025-007',
        customerName: 'ЗАО "УралСталь"',
        quantity: 1000,
        deadline: new Date('2025-07-05T00:00:00'),
        progressPercent: 0,
        createdAt: new Date('2025-05-14T01:21:15.898Z'),
        updatedAt: new Date('2025-05-14T01:21:15.898Z')
      },
      {
        id: 5,
        orderName: 'ЦК 241',
        customerName: 'АО Агидель',
        quantity: 500,
        deadline: new Date('2025-06-27T00:00:00'),
        progressPercent: 0,
        createdAt: new Date('2025-06-10T22:54:28.031Z'),
        updatedAt: new Date('2025-06-10T22:56:04.142Z')
      }
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('production_plans', null, {});
  }
};
