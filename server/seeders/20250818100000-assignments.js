'use strict';

module.exports = {
  async up(queryInterface) {
    // вспомогательные даты
    const now          = new Date();               // сегодня
    const tomorrow     = new Date(now);  tomorrow.setDate(now.getDate() + 1);
    const twoDaysAgo   = new Date(now);  twoDaysAgo.setDate(now.getDate() - 2);

    // начало/конец смены два дня назад
    const shiftStart   = new Date(twoDaysAgo); shiftStart.setHours(8,  0, 0, 0);
    const shiftEnd     = new Date(twoDaysAgo); shiftEnd.setHours(16, 0, 0, 0);

    await queryInterface.bulkInsert('assignments', [
      {
        id: 1,
        operatorId:       3,
        productionPlanId: 1,
        techCardId:       1,
        shiftDate:        now,            // сегодня
        shiftType:        'day',
        taskDescription:  'Обработка партии 50 шт. корпуса подшипника',
        machineNumber:    'Станок-05',
        plannedQuantity:  50,
        actualQuantity:   null,
        status:           'assigned',
        startedAt:        null,
        completedAt:      null,
        notes:            null,
        createdAt:        now,
        updatedAt:        now
      },
      {
        id: 2,
        operatorId:       4,
        productionPlanId: 2,
        techCardId:       2,
        shiftDate:        tomorrow,       // завтра
        shiftType:        'night',
        taskDescription:  'Сварка 30 шт. вала привода',
        machineNumber:    'Сварочный пост-02',
        plannedQuantity:  30,
        actualQuantity:   10,
        status:           'in_progress',
        startedAt:        now,            // уже началась
        completedAt:      null,
        notes:            null,
        createdAt:        now,
        updatedAt:        now
      },
      {
        id: 3,
        operatorId:       5,
        productionPlanId: 3,
        techCardId:       3,
        shiftDate:        twoDaysAgo,     // позавчера
        shiftType:        'day',
        taskDescription:  'Контроль качества готовых крышек двигателя',
        machineNumber:    'Лаб-01',
        plannedQuantity:  40,
        actualQuantity:   40,
        status:           'completed',
        startedAt:        shiftStart,     // 08:00
        completedAt:      shiftEnd,       // 16:00
        notes:            'Без замечаний',
        createdAt:        now,
        updatedAt:        now
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('assignments', { id: [1, 2, 3] });
  }
};

