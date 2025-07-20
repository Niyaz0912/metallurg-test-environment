'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('departments', [
      { name: 'Административный', description: '' },
      { name: 'Департамент качества', description: '' },
      { name: 'Департамент персонала', description: '' },
      { name: 'Коммерческий департамент', description: '' },
      { name: 'Производственный департамент', description: '' },
      { name: 'Финансовый департамент', description: '' }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('departments', null, {});
  }
};

