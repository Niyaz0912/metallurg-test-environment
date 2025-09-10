'use strict';

const db = require('./models');
const path = require('path');

async function runSeeders() {
  try {
    console.log('🌱 Запускаем сидеры в правильном порядке...');

    const seeders = [
      '20250818094000-departments.js',
      '20250818094500-users.js',
      '20250818095000-tech-cards.js',
      '20250818095500-production-plans.js',
      '20250818100000-assignments.js',
      '20250909100000-add-test-assignments.js'
    ];

    const queryInterface = db.sequelize.getQueryInterface();

    for (const file of seeders) {
      const seeder = require(path.join(__dirname, 'seeders', file));

      if (seeder.up && typeof seeder.up === 'function') {
        console.log(`📝 Запускаем сидер: ${file}`);
        await seeder.up(queryInterface, db.Sequelize);
        console.log(`✅ Сидер ${file} выполнен`);
      } else {
        console.log(`⚠️ Пропускаем неподходящий файл: ${file}`);
      }
    }

    console.log('✅ Все сидеры выполнены успешно!');
  } catch (error) {
    console.error('❌ Ошибка при выполнении сидеров:', error);
    console.error('Stack:', error.stack);
  } finally {
    await db.sequelize.close();
    process.exit(0);
  }
}

runSeeders();
