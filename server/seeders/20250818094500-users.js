'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('users', [
      {
        id: 1,
        username: 'admin',
        firstName: 'Админ',
        lastName: 'Системный',
        role: 'admin',
        phone: '+79001234567',
        masterId: null,
        passwordHash: '123456', // простой пароль для тестов
        departmentId: 1,
        position: 'Администратор',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        username: 'director',
        firstName: 'Анатолий',
        lastName: 'Директоров',
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
        username: 'master',
        firstName: 'Иван',
        lastName: 'Мастеров',
        role: 'master',
        phone: '+79005554433',
        masterId: 2,
        passwordHash: '123456',
        departmentId: 3, // департамент "Качества"
        position: 'Мастер',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        username: 'employee1',
        firstName: 'Светлана',
        lastName: 'Контролёрова',
        role: 'employee',
        phone: '+79003332211',
        masterId: 3,
        passwordHash: '123456',
        departmentId: 3, // департамент "Качества"
        position: 'Контролер качества',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        username: 'employee2',
        firstName: 'Олег',
        lastName: 'Планировщиков',
        role: 'employee',
        phone: '+79009998877',
        masterId: 3,
        passwordHash: '123456',
        departmentId: 1, // департамент "Административный"
        position: 'Специалист по планированию',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {
      validate: false, // отключаем валидацию
      ignoreDuplicates: true
    });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', {
      username: ['admin', 'director', 'master', 'employee1', 'employee2']
    });
  }
};

