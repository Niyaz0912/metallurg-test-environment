'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log('Начинаем загрузку департаментов...');
      
      return await queryInterface.bulkInsert('Departments', [
        {
          id: 1,
          name: 'Администрация',
          description: 'Административный департамент отвечает за общее управление предприятием, стратегическое планирование и координацию работы всех подразделений.'
        },
        {
          id: 2,
          name: 'ОТК',
          description: 'Департамент качества контролирует соответствие продукции и процессов стандартам качества, проводит внутренние аудиты и способствует постоянному улучшению.'
        },
        // ... остальные департаменты
      ], {});
      
    } catch (error) {
      console.error('ДЕТАЛЬНАЯ ОШИБКА в Seeder Departments:');
      console.error('Сообщение:', error.message);
      console.error('Код ошибки:', error.original?.errno);
      console.error('SQL состояние:', error.original?.sqlState);
      console.error('Полная ошибка:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Departments', null, {});
  }
};
