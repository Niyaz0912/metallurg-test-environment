'use strict';

module.exports = {
  async up(queryInterface) {
    console.log('🚀 Создаем сменные задания...');
    
    // Сначала очищаем таблицу
    await queryInterface.bulkDelete('assignments', null, {});

    // Вспомогательные даты
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(now.getDate() - 2);

    // Начало/конец смены два дня назад
    const shiftStart = new Date(twoDaysAgo);
    shiftStart.setHours(8, 0, 0, 0);
    const shiftEnd = new Date(twoDaysAgo);
    shiftEnd.setHours(16, 0, 0, 0);

    const assignments = [
      {
        id: 1,
        operatorId: 3, // master из users
        techCardId: 1,
        shiftDate: now.toISOString().split('T')[0], // YYYY-MM-DD формат для DATEONLY
        taskDescription: 'Обработка партии 50 шт. корпуса подшипника',
        machineNumber: 'Станок-05',
        plannedQuantity: 50,
        actualQuantity: null,
        startedAt: null,
        completedAt: null,
        notes: null,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        operatorId: 4, // employee1 из users
        techCardId: 2,
        shiftDate: tomorrow.toISOString().split('T')[0],
        taskDescription: 'Сварка 30 шт. вала привода',
        machineNumber: 'Сварочный пост-02',
        plannedQuantity: 30,
        actualQuantity: 10,
        startedAt: now,
        completedAt: null,
        notes: null,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        operatorId: 5, // employee2 из users
        techCardId: 3,
        shiftDate: twoDaysAgo.toISOString().split('T')[0],
        taskDescription: 'Контроль качества готовых крышек двигателя',
        machineNumber: 'Лаб-01',
        plannedQuantity: 40,
        actualQuantity: 40,
        startedAt: shiftStart,
        completedAt: shiftEnd,
        notes: 'Без замечаний',
        createdAt: now,
        updatedAt: now
      }
    ];

    await queryInterface.bulkInsert('assignments', assignments, {
      ignoreDuplicates: true,
      validate: false, // Избегаем проблем с хуками модели
    });

    console.log('✅ Сменные задания созданы успешно!');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('assignments', null, {});
  }
};


