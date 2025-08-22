'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const db = {};

// Инициализация Sequelize
let sequelize;

if (env === 'test') {
  // Для тестов используем SQLite в памяти
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  });
} else if (env === 'production') {
  // Для production на Railway используем прямые переменные окружения
  sequelize = new Sequelize({
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'metallurgdb',
    username: process.env.MYSQLUSER || process.env.DB_USERNAME || 'metuser',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
    host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
    port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
    dialect: 'mysql', // Жестко задаем, чтобы избежать проблем с переменными
    logging: false,
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
  // Для development используем config.js
  const config = require(__dirname + '/../config/config.js')[env];
  
  if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
  } else {
    sequelize = new Sequelize(
      config.database,
      config.username,
      config.password,
      {
        host: config.host,
        dialect: 'mysql', // Жестко задаем вместо config.dialect
        logging: config.logging || false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    );
  }
}

// Проверка подключения к БД (НЕ для тестов)
if (env !== 'test') {
  (async () => {
    try {
      await sequelize.authenticate();
      console.log('✅ Database connection established');
      console.log('🔄 Database sync disabled (preventing key duplication)');
      
      // Синхронизация моделей (только в development)
      if (env === 'development') {
        await sequelize.sync({ alter: false });
        console.log('🔄 Database models synced');
      }
    } catch (error) {
      console.error('❌ Unable to connect to the database:', error.message);
      console.error('📚 Stack:', error.stack);
    }
  })();
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

// Экспорт
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
