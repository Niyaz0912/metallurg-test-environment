'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const assignments = [
      {
        id: 4,
        operatorId: 3, 
        techCardId: 1,
        shiftDate: now.toISOString().split('T')[0],
        taskDescription: 'Test assignment 1',
        machineNumber: 'Станок-01',
        plannedQuantity: 10,
        actualQuantity: null,
        startedAt: null,
        completedAt: null,
        notes: 'Test note 1',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 5,
        operatorId: 4,
        techCardId: 2,
        shiftDate: now.toISOString().split('T')[0],
        taskDescription: 'Test assignment 2',
        machineNumber: 'Станок-02',
        plannedQuantity: 20,
        actualQuantity: null,
        startedAt: null,
        completedAt: null,
        notes: 'Test note 2',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 6,
        operatorId: 5,
        techCardId: 3,
        shiftDate: now.toISOString().split('T')[0],
        taskDescription: 'Test assignment 3',
        machineNumber: 'Станок-03',
        plannedQuantity: 30,
        actualQuantity: null,
        startedAt: null,
        completedAt: null,
        notes: 'Test note 3',
        createdAt: now,
        updatedAt: now
      }
    ];

    await queryInterface.bulkInsert('assignments', assignments, {
      ignoreDuplicates: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('assignments', { 
      id: [4, 5, 6] 
    });
  }
};
