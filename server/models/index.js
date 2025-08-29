'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);

// ОТЛАДОЧНАЯ ИНФОРМАЦИЯ
console.log('🔍 DEBUG: Environment detection');
console.log('NODE_ENV from process.env:', process.env.NODE_ENV);
console.log('RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('MYSQLHOST:', process.env.MYSQLHOST ? 'SET' : 'NOT SET');
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
  
  // ПРИОРИТЕТ 1: Используем DATABASE_URL (рекомендуемый способ Railway)
  if (process.env.DATABASE_URL) {
    console.log('✅ Using DATABASE_URL connection');
    sequelize = new Sequelize(process.env.DATABASE_URL, {
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
  } 
  // ПРИОРИТЕТ 2: Fallback на отдельные переменные
  else if (process.env.MYSQLHOST && process.env.MYSQLDATABASE) {
    console.log('⚠️ Using separate MySQL variables');
    sequelize = new Sequelize({
      database: process.env.MYSQLDATABASE,
      username: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      host: process.env.MYSQLHOST,
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
  } 
  // ОШИБКА: Нет переменных для подключения
  else {
    console.error('❌ No database connection variables found!');
    console.error('   Need either DATABASE_URL or MYSQL* variables');
  }
} else {
  console.log('⚠️ DEVELOPMENT MODE');
  
  // Для development используем локальные настройки
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
      
      // ВРЕМЕННО: Принудительно создаем таблицы в production
      if (env === 'production') {
        console.log('🔄 Creating tables automatically...');
        await sequelize.sync({ force: false, alter: true });
        console.log('✅ All tables created successfully');
      }
      
      /*
      // Синхронизация моделей в development
      if (env === 'development') {
        await sequelize.sync({ alter: true });
        console.log('🔄 Database models synced');
      }
      */
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


