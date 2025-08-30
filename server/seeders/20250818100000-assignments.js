'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🚀 Создаем сменные задания...');

    const assignments = [
      {
        id: 1,
        operatorId: 1, // admin
        productionPlanId: 1,
        techCardId: 1,
        shiftDate: new Date(),
        shiftType: 'day',
        taskDescription: 'Обработка партии 50 шт. корпуса подшипника',
        machineNumber: 'Станок-05',
        plannedQuantity: 50,
        actualQuantity: null,
        status: 'assigned',
        startedAt: null,
        completedAt: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        operatorId: 2, // director
        productionPlanId: 2,
        techCardId: 2,
        shiftDate: new Date(),
        shiftType: 'night',
        taskDescription: 'Сварка 30 шт. вала привода',
        machineNumber: 'Сварочный пост-02',
        plannedQuantity: 30,
        actualQuantity: 10,
        status: 'in_progress',
        startedAt: new Date(),
        completedAt: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        operatorId: 1, // admin
        productionPlanId: 3,
        techCardId: 3,
        shiftDate: new Date(),
        shiftType: 'day',
        taskDescription: 'Контроль качества готовых крышек двигателя',
        machineNumber: 'Лаб-01',
        plannedQuantity: 40,
        actualQuantity: 40,
        status: 'completed',
        startedAt: new Date(),
        completedAt: new Date(),
        notes: 'Без замечаний',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('assignments', assignments, {});

    console.log('✅ Сменные задания созданы успешно!');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('assignments', null, {});
  }
};


