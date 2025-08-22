process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false,
});

// Инициализация БД
beforeAll(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    console.log('✅ Test database ready');
  } catch (error) {
    console.error('❌ Test database failed:', error);
  }
});

afterAll(async () => {
  await sequelize.close();
});

module.exports = { sequelize };

