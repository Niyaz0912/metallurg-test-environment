'use strict';

module.exports = {
  up: async (queryInterface) => {
    console.log('🔥 Запускаем ГЛАВНУЮ ОЧИСТКУ перед заполнением...');
    // Очищаем таблицы в порядке, обратном зависимостям
    await queryInterface.bulkDelete('assignments', null, {});
    await queryInterface.bulkDelete('tech_card_executions', null, {});
    await queryInterface.bulkDelete('tech_card_accesses', null, {});
    await queryInterface.bulkDelete('tasks', null, {});
    await queryInterface.bulkDelete('production_plans', null, {});
    await queryInterface.bulkDelete('tech_cards', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('departments', null, {});
    console.log('✅ Очистка завершена.');

    console.log('🚀 Создаем отделы...');
    await queryInterface.bulkInsert(
      'departments',
      [
        { id: 1, name: 'Административный', description: 'Административное управление и общие вопросы' },
        { id: 2, name: 'HR', description: 'Управление персоналом и кадровые вопросы' },
        { id: 3, name: 'Качества', description: 'Контроль качества продукции и процессов' },
        { id: 4, name: 'Коммерческий', description: 'Продажи, закупки и работа с клиентами' },
        { id: 5, name: 'Производства', description: 'Производственные процессы и техническое планирование' },
        { id: 6, name: 'Финансовый', description: 'Финансовое планирование и бухгалтерский учет' },
      ],
      {}
    );
    console.log('✅ Отделы созданы.');
  },

  down: async (queryInterface) => {
    // Для down команды порядок тоже важен
    await queryInterface.bulkDelete('assignments', null, {});
    await queryInterface.bulkDelete('tech_card_executions', null, {});
    await queryInterface.bulkDelete('tech_card_accesses', null, {});
    await queryInterface.bulkDelete('tasks', null, {});
    await queryInterface.bulkDelete('production_plans', null, {});
    await queryInterface.bulkDelete('tech_cards', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('departments', null, {});
  },
};


