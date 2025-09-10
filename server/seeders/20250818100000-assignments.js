'use strict';

module.exports = {
  async up(queryInterface) {
    console.log('🚀 Создаем сменные задания...');
    
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(now.getDate() - 2);

    const shiftStart = new Date(twoDaysAgo);
    shiftStart.setHours(8, 0, 0, 0);
    const shiftEnd = new Date(twoDaysAgo);
    shiftEnd.setHours(16, 0, 0, 0);

    const assignments = [
      {
        id: 1,
        operatorId: 3,
        productionPlanId: 1, // ✅ ДОБАВЛЕНО: обязательное поле
        techCardId: 1,
        shiftDate: now.toISOString().split('T')[0],
        shiftType: 'day', // ✅ ДОБАВЛЕНО: обязательное поле
        taskDescription: 'Обработка партии 50 шт. корпуса подшипника',
        machineNumber: 'Станок-05',
        detailName: 'Корпус подшипника', // ✅ ДОБАВЛЕНО: обязательное поле
        customerName: 'ООО Заказчик 1', // ✅ ДОБАВЛЕНО: обязательное поле
        plannedQuantity: 50,
        actualQuantity: null,
        status: 'assigned', // ✅ ДОБАВЛЕНО: со значением по умолчанию
        startedAt: null,
        completedAt: null,
        notes: null,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        operatorId: 4,
        productionPlanId: 2, // ✅ ДОБАВЛЕНО
        techCardId: 2,
        shiftDate: tomorrow.toISOString().split('T')[0],
        shiftType: 'day', // ✅ ДОБАВЛЕНО
        taskDescription: 'Сварка 30 шт. вала привода',
        machineNumber: 'Сварочный пост-02',
        detailName: 'Вал привода', // ✅ ДОБАВЛЕНО
        customerName: 'АО Промышленность', // ✅ ДОБАВЛЕНО
        plannedQuantity: 30,
        actualQuantity: 10,
        status: 'in_progress', // ✅ ДОБАВЛЕНО
        startedAt: now,
        completedAt: null,
        notes: null,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        operatorId: 5,
        productionPlanId: 3, // ✅ ДОБАВЛЕНО
        techCardId: 3,
        shiftDate: twoDaysAgo.toISOString().split('T')[0],
        shiftType: 'day', // ✅ ДОБАВЛЕНО
        taskDescription: 'Контроль качества готовых крышек двигателя',
        machineNumber: 'Лаб-01',
        detailName: 'Крышка двигателя', // ✅ ДОБАВЛЕНО
        customerName: 'ЗАО Металлургия', // ✅ ДОБАВЛЕНО
        plannedQuantity: 40,
        actualQuantity: 40,
        status: 'completed', // ✅ ДОБАВЛЕНО
        startedAt: shiftStart,
        completedAt: shiftEnd,
        notes: 'Без замечаний',
        createdAt: now,
        updatedAt: now
      }
    ];

    await queryInterface.bulkInsert('assignments', assignments, {
      ignoreDuplicates: true,
      validate: false,
    });

    console.log('✅ Сменные задания созданы успешно!');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('assignments', { 
      id: [1, 2, 3] 
    });
  }
};
