'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('tech_cards', [
      {
        id: 1,
        customer: 'ПАО Северсталь',
        order: 'Заказ-2024-001',
        productName: 'Корпус подшипникового узла',
        partNumber: 'КПУ-001-2024',
        quantity: 100,
        pdfUrl: '/uploads/tech-cards/sample-tech-card-001.pdf',
        totalProducedQuantity: 0,
        status: 'active',
        priority: 'high',
        plannedEndDate: new Date('2024-03-01'),
        notes: 'Тестовая техкарта для демонстрации системы',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        customer: 'ООО Машзавод',
        order: 'Заказ-2024-002',
        productName: 'Роликовый механизм',
        partNumber: 'РМ-002-2024',
        quantity: 50,
        pdfUrl: '/uploads/tech-cards/sample-tech-card-002.pdf',
        totalProducedQuantity: 10,
        status: 'active',
        priority: 'medium',
        plannedEndDate: new Date('2024-04-01'),
        notes: 'Техкарта для роликового механизма конвейера',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        customer: 'АО Металлург',
        order: 'Заказ-2024-003',
        productName: 'Вал приводной',
        partNumber: 'ВП-003-2024',
        quantity: 75,
        pdfUrl: '/uploads/tech-cards/sample-tech-card-003.pdf',
        totalProducedQuantity: 0,
        status: 'draft',
        priority: 'low',
        plannedEndDate: new Date('2024-05-01'),
        notes: 'Техкарта для изготовления приводного вала',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('tech_cards', null, {});
  }
};
