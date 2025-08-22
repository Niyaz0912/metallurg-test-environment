'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
// УБИРАЕМ импорт process - он глобально доступен!
const basename = path.basename(__filename);

// ОТЛАДОЧНАЯ ИНФОРМАЦИЯ
console.log('🔍 DEBUG: Environment detection');
console.log('NODE_ENV from process.env:', process.env.NODE_ENV);
console.log('RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT);
console.log('MYSQLHOST:', process.env.MYSQLHOST);
console.log('MYSQLDATABASE:', process.env.MYSQLDATABASE);

// ПРИНУДИТЕЛЬНО УСТАНАВЛИВАЕМ PRODUCTION для Railway
const env = process.env.RAILWAY_ENVIRONMENT ? 'production' : (process.env.NODE_ENV || 'development');

console.log('🎯 Final ENV mode:', env);

const db = {};
let sequelize;

if (env === 'test') {
  // Для тестов используем SQLite в памяти
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  });
} else if (env === 'production') {
  console.log('🚀 PRODUCTION MODE - Using Railway MySQL');
  
  // Проверяем все переменные
  const requiredVars = ['MYSQLHOST', 'MYSQLUSER', 'MYSQLPASSWORD', 'MYSQLDATABASE'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required MySQL variables:', missingVars);
  }
  
  sequelize = new Sequelize({
    database: process.env.MYSQLDATABASE,
    username: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT || 3306,
    dialect: 'mysql',
    logging: false, // Убираем SQL логи для чистоты
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      connectTimeout: 60000,
    }
  });
} else {
  console.log('⚠️ DEVELOPMENT MODE - This should not happen on Railway!');
  
  // Fallback к переменным окружения для development
  sequelize = new Sequelize({
    database: process.env.DB_NAME || 'metallurgdb',
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
  });
}

// Загрузка моделей
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Установка ассоциаций
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Проверка подключения к БД (НЕ для тестов)
if (env !== 'test') {
  (async () => {
    try {
      await sequelize.authenticate();
      console.log('✅ Database connection established successfully');
      
      // Синхронизация моделей (только в development)
      if (env === 'development') {
        await sequelize.sync({ alter: false });
        console.log('🔄 Database models synced');
      }
    } catch (error) {
      console.error('❌ Unable to connect to the database:', error.message);
      console.error('📚 Full error:', error);
      
      // В production не останавливаем приложение из-за БД
      if (env !== 'production') {
        process.exit(1);
      }
    }
  })();
}

// Экспорт
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

