const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('metallurg', 'metuser', 'Alim@3011', {
  host: '127.0.0.1',
  dialect: 'mysql'
});

async function checkMeta() {
  try {
    const [results] = await sequelize.query('SELECT * FROM SequelizeMeta;');
    if (results.length === 0) {
      console.log('Таблица SequelizeMeta пуста — миграции не применялись.');
    } else {
      console.log('Применённые миграции:', results);
    }
  } catch (err) {
    console.error('Ошибка при запросе:', err.message);
  } finally {
    await sequelize.close();
  }
}

checkMeta();

