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
  // Для production на Railway используем ТОЛЬКО Railway переменные
  console.log('🔍 Production mode - using Railway MySQL variables');
  console.log('MYSQLHOST:', process.env.MYSQLHOST ? 'SET' : 'NOT SET');
  console.log('MYSQLDATABASE:', process.env.MYSQLDATABASE ? 'SET' : 'NOT SET');
  
  sequelize = new Sequelize({
    database: process.env.MYSQLDATABASE || 'railway',
    username: process.env.MYSQLUSER || 'root', 
    password: process.env.MYSQLPASSWORD,
    host: process.env.MYSQLHOST || 'mysql.railway.internal',
    port: process.env.MYSQLPORT || 3306,
    dialect: 'mysql',
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
  // Для development пытаемся загрузить config с проверками
  let config;
  
  try {
    // Сначала пробуем config.js
    config = require(__dirname + '/../config/config.js')[env];
  } catch (error) {
    try {
      // Если config.js не найден, пробуем config.json
      config = require(__dirname + '/../config/config.json')[env];
    } catch (jsonError) {
      console.warn('⚠️ No config file found, using environment variables');
      config = {};
    }
  }
  
  if (config && config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
  } else if (config && config.database) {
    sequelize = new Sequelize(
      config.database,
      config.username,
      config.password,
      {
        host: config.host || 'localhost',
        dialect: config.dialect || 'mysql',
        logging: config.logging || false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    );
  } else {
    // Fallback к переменным окружения для development
    console.warn('⚠️ Using environment variables for development');
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
}

// Загрузка моделей ПЕРЕД проверкой подключения
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

