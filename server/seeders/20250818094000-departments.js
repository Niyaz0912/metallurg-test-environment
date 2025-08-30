'use strict';

module.exports = {
  up: async (queryInterface) => {
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
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('departments', null, {});
  },
};


