'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
  // Если индекс на username уже есть, можно тоже не создавать повторно
  // await queryInterface.addIndex('users', ['username'], {
  //   unique: true,
  //   name: 'users_username_unique'
  // });

  // Уберите добавление колонки position, так как она уже есть
  // await queryInterface.addColumn('users', 'position', {
  //   type: Sequelize.STRING,
  //   allowNull: true,
  // });
},


  down: async (queryInterface, Sequelize) => {
    // Откат добавления индекса
    await queryInterface.removeIndex('users', 'users_username_unique');

    // Откат добавления столбца position
    await queryInterface.removeColumn('users', 'position');
  }
};
