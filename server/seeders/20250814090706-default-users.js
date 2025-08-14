'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    return queryInterface.bulkInsert('Users', [
      {
        firstName: 'Администратор',
        lastName: 'Системы',
        email: 'admin@company.com',
        password: hashedPassword,
        role: 'admin',
        departmentId: 1,
        position: 'Администратор',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Иван',
        lastName: 'Мастеров',
        email: 'master@company.com', 
        password: hashedPassword,
        role: 'master',
        departmentId: 1,
        position: 'Мастер смены',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        firstName: 'Петр',
        lastName: 'Операторов',
        email: 'operator@company.com',
        password: hashedPassword,
        role: 'employee', 
        departmentId: 1,
        position: 'Оператор станка',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', null, {});
  }
};

