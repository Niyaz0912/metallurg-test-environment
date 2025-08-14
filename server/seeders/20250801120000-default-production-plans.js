'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log('🔧 Начинаем загрузку планов производства...');
      
      // Проверяем есть ли уже планы производства
      const [results] = await queryInterface.sequelize.query(
        'SELECT COUNT(*) as count FROM production_plans'
      );
      
      if (results[0].count > 0) {
        console.log('⚠️ Планы производства уже существуют, пропускаем загрузку...');
        return;
      }

      // Проверяем есть ли tech_cards (нужны для foreign key)
      const [techCards] = await queryInterface.sequelize.query(
        'SELECT COUNT(*) as count FROM tech_cards'
      );
      
      console.log(`📋 Найдено tech_cards: ${techCards[0].count}`);
      
      return await queryInterface.bulkInsert('production_plans', [
        {
          id: 1,
          customerName: 'ООО Транспортные системы',
          orderName: 'Заказ №2024-001 - Корпусные детали',
          quantity: 100,
          completedQuantity: 25,
          progressPercent: 25.0,
          deadline: new Date('2024-03-01'),
          status: 'in_progress',
          priority: 3,
          notes: 'Срочный заказ, требует особого контроля качества',
          techCardId: techCards[0].count >= 1 ? 1 : null, // Ссылаемся только если tech_card существует
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          customerName: 'АО Машиностроение',
          orderName: 'Заказ №2024-002 - Роликовые механизмы',
          quantity: 50,
          completedQuantity: 0,
          progressPercent: 0.0,
          deadline: new Date('2024-04-15'),
          status: 'planned',
          priority: 2,
          notes: 'Стандартный план производства',
          techCardId: techCards[0].count >= 2 ? 2 : null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 3,
          customerName: 'ПАО Логистика',
          orderName: 'Заказ №2024-003 - Приводные валы',
          quantity: 75,
          completedQuantity: 75,
          progressPercent: 100.0,
          deadline: new Date('2024-02-28'),
          status: 'completed',
          priority: 1,
          notes: 'Заказ выполнен в срок, качество соответствует требованиям',
          techCardId: techCards[0].count >= 3 ? 3 : null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 4,
          customerName: 'ЗАО Металлургия',
          orderName: 'Заказ №2024-004 - Запчасти для ремонта',
          quantity: 25,
          completedQuantity: 10,
          progressPercent: 40.0,
          deadline: new Date('2024-05-10'),
          status: 'in_progress',
          priority: 2,
          notes: 'Производство согласно техническим требованиям заказчика',
          techCardId: null, // Без привязки к техкарте
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ], {});
      
    } catch (error) {
      console.error('❌ ОШИБКА в Production Plans Seeder:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('production_plans', null, {});
  }
};

