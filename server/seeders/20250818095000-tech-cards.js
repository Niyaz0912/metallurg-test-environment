'use strict';

module.exports = {
  async up(queryInterface) {
    const techCards = [
      {
        id: 1,
        customer: 'ООО Заказчик 1',
        order: 'ORD-001',
        productName: 'Корпус подшипника',
        partNumber: 'KP-001',
        quantity: 100,
        pdfUrl: 'https://example.com/kp-001.pdf',
        pdfFileSize: 123456,
        totalProducedQuantity: 0,
        status: 'active',
        priority: 'medium',
        plannedEndDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        actualEndDate: null,
        notes: 'Первая производственная партия',
        createdById: 1,
      },
      {
        id: 2,
        customer: 'АО Промышленность',
        order: 'ORD-002',
        productName: 'Вал привода',
        partNumber: 'VP-002',
        quantity: 50,
        pdfUrl: 'https://example.com/vp-002.pdf',
        pdfFileSize: 234567,
        totalProducedQuantity: 0,
        status: 'draft',
        priority: 'high',
        plannedEndDate: new Date(new Date().setDate(new Date().getDate() + 45)),
        actualEndDate: null,
        notes: null,
        createdById: 2,
      },
      {
        id: 3,
        customer: 'ЗАО Металлургия',
        order: 'ORD-003',
        productName: 'Крышка двигателя',
        partNumber: 'KD-003',
        quantity: 200,
        pdfUrl: null,
        pdfFileSize: null,
        totalProducedQuantity: 0,
        status: 'archived',
        priority: 'low',
        plannedEndDate: null,
        actualEndDate: new Date(new Date().setDate(new Date().getDate() - 10)),
        notes: 'Проект завершён',
        createdById: 1,
      }
    ];

    // 1) Обновляем существующие техкарты по order (без удаления - не ломает FK)
    for (const tc of techCards) {
      await queryInterface.bulkUpdate(
        'tech_cards',
        {
          customer: tc.customer,
          productName: tc.productName,
          partNumber: tc.partNumber,
          quantity: tc.quantity,
          pdfUrl: tc.pdfUrl,
          pdfFileSize: tc.pdfFileSize,
          totalProducedQuantity: tc.totalProducedQuantity,
          status: tc.status,
          priority: tc.priority,
          plannedEndDate: tc.plannedEndDate,
          actualEndDate: tc.actualEndDate,
          notes: tc.notes,
          createdById: tc.createdById,
          updatedAt: new Date(),
        },
        { order: tc.order }
      );
    }

    // 2) Вставляем отсутствующие, игнорируя дубликаты
    const rowsToInsert = techCards.map(tc => ({
      id: tc.id,
      customer: tc.customer,
      order: tc.order,
      productName: tc.productName,
      partNumber: tc.partNumber,
      quantity: tc.quantity,
      pdfUrl: tc.pdfUrl,
      pdfFileSize: tc.pdfFileSize,
      totalProducedQuantity: tc.totalProducedQuantity,
      status: tc.status,
      priority: tc.priority,
      plannedEndDate: tc.plannedEndDate,
      actualEndDate: tc.actualEndDate,
      notes: tc.notes,
      createdById: tc.createdById,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert('tech_cards', rowsToInsert, {
      ignoreDuplicates: true,
      validate: false,
    });
  },

  async down(queryInterface) {
    // Мягкая очистка по order (только если нет FK-ссылок)
    await queryInterface.bulkDelete('tech_cards', {
      order: ['ORD-001', 'ORD-002', 'ORD-003']
    });
  }
};

