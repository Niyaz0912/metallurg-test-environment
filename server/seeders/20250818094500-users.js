'use strict';

module.exports = {
  async up(queryInterface) {
    console.log('🚀 Создаем пользователей...');
    
    const users = [
      {
        id: 1,
        username: 'admin',
        firstName: 'Админ',
        lastName: 'Системный',
        role: 'admin',
        phone: '+79001234567',
        masterId: null,
        passwordHash: '123456', // простой текст для начала
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
        passwordHash: '123456',
        departmentId: 1,
        position: 'Директор',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        username: 'master_prod',
        firstName: 'Мастер',
        lastName: 'Производства',
        role: 'master',
        phone: '+79001112233',
        masterId: null,
        passwordHash: '123456',
        departmentId: 5,
        position: 'Мастер',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        username: 'employee_prod',
        firstName: 'Сотрудник',
        lastName: 'Производства',
        role: 'employee',
        phone: '+79002223344',
        masterId: 3, // Master is user with id 3
        passwordHash: '123456',
        departmentId: 5,
        position: 'Сотрудник',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        username: 'employee_quality',
        firstName: 'Сотрудник',
        lastName: 'Качества',
        role: 'employee',
        phone: '+79003334455',
        masterId: null,
        passwordHash: '123456',
        departmentId: 3,
        position: 'Сотрудник',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 6,
        username: 'employee_hr',
        firstName: 'Сотрудник',
        lastName: 'HR',
        role: 'employee',
        phone: '+79004445566',
        masterId: null,
        passwordHash: '123456',
        departmentId: 2,
        position: 'Сотрудник',
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
    await queryInterface.bulkDelete('users', {
      username: ['admin', 'director', 'master_prod', 'employee_prod', 'employee_quality', 'employee_hr']
    });
  }
};