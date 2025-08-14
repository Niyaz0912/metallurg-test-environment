'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log('🔧 Начинаем загрузку пользователей...');
      
      // Проверяем есть ли уже пользователи
      const [results] = await queryInterface.sequelize.query(
        'SELECT COUNT(*) as count FROM users'
      );
      
      if (results[0].count > 0) {
        console.log('⚠️ Пользователи уже существуют, пропускаем загрузку...');
        console.log(`👥 Найдено пользователей: ${results[0].count}`);
        return;
      }
      
      console.log('✅ Таблица users пустая, загружаем тестовых пользователей...');
      
      // Хэшируем пароль для тестовых пользователей (пароль: 123456)
      const testPassword = await bcrypt.hash('123456', 10);
      
      return await queryInterface.bulkInsert('users', [
        {
          id: 1,
          username: 'admin',
          firstName: 'Администратор',
          lastName: 'Системы',
          role: 'admin',
          phone: '+7-917-123-4567',
          masterId: null,
          passwordHash: testPassword,
          departmentId: 1, // Администрация
          position: 'Системный администратор',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          username: 'director1',
          firstName: 'Иван',
          lastName: 'Петров',
          role: 'director',
          phone: '+7-917-234-5678',
          masterId: null,
          passwordHash: testPassword,
          departmentId: 1, // Администрация
          position: 'Директор производства',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 3,
          username: 'master1',
          firstName: 'Сергей',
          lastName: 'Сидоров',
          role: 'master',
          phone: '+7-917-345-6789',
          masterId: null,
          passwordHash: testPassword,
          departmentId: 2, // ОТК
          position: 'Мастер контроля качества',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 4,
          username: 'employee1',
          firstName: 'Алексей',
          lastName: 'Иванов',
          role: 'employee',
          phone: '+7-917-456-7890',
          masterId: 3, // Подчиняется мастеру Сергею
          passwordHash: testPassword,
          departmentId: 2, // ОТК  
          position: 'Контролер качества',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 5,
          username: 'employee2',
          firstName: 'Михаил',
          lastName: 'Козлов',
          role: 'employee',
          phone: '+7-917-567-8901',
          masterId: 3, // Также подчиняется мастеру
          passwordHash: testPassword,
          departmentId: 1, // Администрация
          position: 'Специалист по планированию',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ], {});
      
    } catch (error) {
      console.error('❌ ДЕТАЛЬНАЯ ОШИБКА в Users Seeder:');
      console.error('Сообщение:', error.message);
      console.error('Тип ошибки:', error.name);
      if (error.original) {
        console.error('Код ошибки:', error.original.errno);
        console.error('SQL сообщение:', error.original.sqlMessage);
      }
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null, {});
  }
};


