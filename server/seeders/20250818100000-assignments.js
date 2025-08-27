'use strict';

module.exports = {
  async up(queryInterface) {
    console.log('🚀 Создаем сменные задания...');
    
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
        productionPlanId: 1,
        techCardId: 1,
        shiftDate: now.toISOString().split('T')[0], // YYYY-MM-DD формат для DATEONLY
        shiftType: 'day',
        taskDescription: 'Обработка партии 50 шт. корпуса подшипника',
        machineNumber: 'Станок-05',
        plannedQuantity: 50,
        actualQuantity: null,
        status: 'assigned',
        startedAt: null,
        completedAt: null,
        notes: null,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        operatorId: 4, // employee1 из users
        productionPlanId: 2,
        techCardId: 2,
        shiftDate: tomorrow.toISOString().split('T')[0],
        shiftType: 'night',
        taskDescription: 'Сварка 30 шт. вала привода',
        machineNumber: 'Сварочный пост-02',
        plannedQuantity: 30,
        actualQuantity: 10,
        status: 'in_progress',
        startedAt: now,
        completedAt: null,
        notes: null,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        operatorId: 5, // employee2 из users
        productionPlanId: 3,
        techCardId: 3,
        shiftDate: twoDaysAgo.toISOString().split('T')[0],
        shiftType: 'day',
        taskDescription: 'Контроль качества готовых крышек двигателя',
        machineNumber: 'Лаб-01',
        plannedQuantity: 40,
        actualQuantity: 40,
        status: 'completed',
        startedAt: shiftStart,
        completedAt: shiftEnd,
        notes: 'Без замечаний',
        createdAt: now,
        updatedAt: now
      }
    ];

    // Обновляем существующие задания по id (идемпотентность)
    for (const assignment of assignments) {
      await queryInterface.bulkUpdate(
        'assignments',
        {
          operatorId: assignment.operatorId,
          productionPlanId: assignment.productionPlanId,
          techCardId: assignment.techCardId,
          shiftDate: assignment.shiftDate,
          shiftType: assignment.shiftType,
          taskDescription: assignment.taskDescription,
          machineNumber: assignment.machineNumber,
          plannedQuantity: assignment.plannedQuantity,
          actualQuantity: assignment.actualQuantity,
          status: assignment.status,
          startedAt: assignment.startedAt,
          completedAt: assignment.completedAt,
          notes: assignment.notes,
          updatedAt: new Date(),
        },
        { id: assignment.id }
      );
    }

    // Вставляем отсутствующие задания
    await queryInterface.bulkInsert('assignments', assignments, {
      ignoreDuplicates: true,
      validate: false, // Избегаем проблем с хуками модели
    });

    console.log('✅ Сменные задания созданы успешно!');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('assignments', { 
      id: [1, 2, 3] 
    });
  }
};


