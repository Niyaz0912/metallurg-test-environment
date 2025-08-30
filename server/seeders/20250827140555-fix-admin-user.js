'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Для тестовой среды устанавливаем пароль как простой текст
    const plainPassword = '123456';

    console.log('INFO: Установка текстового пароля для пользователя admin для тестовой среды...');

    return queryInterface.bulkUpdate('users',
      {
        passwordHash: '$2b$10$3/K9NciheqzEQk9/HHPQL.1iqaudTpIFR4fW6LyVbCkMzMjDicFeq',
        updatedAt: new Date()
      },
      {
        username: 'admin'
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    console.log('INFO: Обратная миграция для fix-admin-user не требуется.');
    return Promise.resolve();
  }
};

