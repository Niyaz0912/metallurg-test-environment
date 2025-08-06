'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Проверяем, есть ли уже запись с ID = 1
    const existingCard = await queryInterface.sequelize.query(
      'SELECT id FROM tech_cards WHERE id = 1',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Создаем только если записи нет
    if (existingCard.length === 0) {
      await queryInterface.bulkInsert('tech_cards', [
        {
          id: 1,
          productName: 'Универсальная карта',
          description: 'Базовая техническая карта для всех операций',
          specifications: JSON.stringify({
            type: 'universal',
            applicableOperations: ['machining', 'assembly', 'quality_control']
          }),
          operationSteps: JSON.stringify([
            { step: 1, description: 'Подготовка оборудования' },
            { step: 2, description: 'Выполнение операции' },
            { step: 3, description: 'Контроль качества' }
          ]),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ], {});

      console.log('✅ Базовая техническая карта создана');
    } else {
      console.log('ℹ️ Базовая техническая карта уже существует');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tech_cards', { id: 1 }, {});
    console.log('🗑️ Базовая техническая карта удалена');
  }
};

