'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log('🔧 Начинаем загрузку пользователей...');
      
      const [results] = await queryInterface.sequelize.query(
        'SELECT COUNT(*) as count FROM users'
      );
      
      if (results[0].count > 0) {
        console.log('⚠️ Пользователи уже существуют, пропускаем загрузку...');
        return;
      }
      
      console.log('✅ Таблица users пустая, загружаем тестовых пользователей...');
      const testPasswordHash = await bcrypt.hash('123456', 10);
      
      return await queryInterface.bulkInsert('users', [
        {
          username: 'admin',
          firstName: 'Администратор',
          lastName: 'Системы',
          role: 'admin',
          phone: '+79171234567',
          masterId: null,
          passwordHash: testPasswordHash,
          position: 'Системный администратор',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          username: 'director1',
          firstName: 'Иван',
          lastName: 'Петров',
          role: 'director',
          phone: '+79172345678',
          masterId: null,
          passwordHash: testPasswordHash,
          position: 'Директор производства',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          username: 'master1',
          firstName: 'Сергей',
          lastName: 'Сидоров',
          role: 'master',
          phone: '+79173456789',
          masterId: null,
          passwordHash: testPasswordHash,
          position: 'Мастер контроля качества',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          username: 'employee1',
          firstName: 'Алексей',
          lastName: 'Иванов',
          role: 'employee',
          phone: '+79174567890',
          masterId: 3, // Подчиняется мастеру с id=3
          passwordHash: testPasswordHash,
          position: 'Контролер качества',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          username: 'employee2',
          firstName: 'Михаил',
          lastName: 'Козлов',
          role: 'employee',
          phone: '+79175678901',
          masterId: 3, // Также подчиняется мастеру с id=3
          passwordHash: testPasswordHash,
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
        console.error('Код ошибки:', error.original.code);
        console.error('SQL сообщение:', error.original.sqlMessage);
      }
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null, {});
  }
};


