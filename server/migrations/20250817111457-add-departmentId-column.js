'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Проверяем, существует ли уже колонка (на случай если она была добавлена вручную)
    const tableDescription = await queryInterface.describeTable('users');
    
    if (!tableDescription.departmentId) {
      await queryInterface.addColumn('users', 'departmentId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'departments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'departmentId');
  }
};
