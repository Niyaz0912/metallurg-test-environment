'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('tech_cards');
    if (!tableDescription.customer) {
      await queryInterface.addColumn('tech_cards', 'customer', {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: 'Unknown'
      });
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('tech_cards', 'customer');
  }
};
