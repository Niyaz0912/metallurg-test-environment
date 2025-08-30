'use strict';

module.exports = {
  async up(queryInterface) {
    console.log('🚀 Создаем пользователей...');
    
ль    const users = [
      {
        id: 1,
        username: 'admin',
        firstName: 'Админ',
        lastName: 'Системный',
        role: 'admin',
        phone: '+79001234567',
        masterId: null,
        passwordHash: '$2b$10$3/K9NciheqzEQk9/HHPQL.1iqaudTpIFR4fW6LyVbCkMzMjDicFeq', // password123
        departmentId: 1,
        position: 'Администратор',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        username: 'director',
        firstName: 'Директор', 
        lastName: 'Главный',
        role: 'director',
        phone: '+79007654321',
        masterId: null,
        passwordHash: '$2b$10$3/K9NciheqzEQk9/HHPQL.1iqaudTpIFR4fW6LyVbCkMzMjDicFeq', // password123
        departmentId: 1,
        position: 'Директор',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('users', users, {
      ignoreDuplicates: true,
      validate: false,
    });

    console.log('✅ Пользователи созданы успешно!');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
