'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log('🔧 Начинаем загрузку техкарт...');
      
      // Проверяем есть ли уже техкарты
      const [results] = await queryInterface.sequelize.query(
        'SELECT COUNT(*) as count FROM tech_cards'
      );
      
      if (results[0].count > 0) {
        console.log('⚠️ Техкарты уже существуют, пропускаем загрузку...');
        console.log(`📋 Найдено техкарт: ${results[0].count}`);
        return;
      }
      
      console.log('✅ Таблица tech_cards пустая, загружаем данные...');
      
      // Остальной код загрузки данных...
      
    } catch (error) {
      console.error('❌ ОШИБКА в Tech Cards Seeder:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('tech_cards', null, {});
  }
};
