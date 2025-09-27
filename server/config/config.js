require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'metuser',
    password: process.env.DB_PASSWORD || 'Alim@3011',
    database: process.env.DB_NAME || 'metallurgdb',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: process.env.DB_DIALECT || 'mysql',
  },
  
  test: {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME ? `${process.env.DB_NAME}_test` : 'default_test_db',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: console.log
  },
  
  // ✅ ПРАВИЛЬНО для FirstByte сервера
  production: {
    username: process.env.DB_USERNAME || 'metallurg_user',
    password: process.env.DB_PASSWORD || 'MetallurgApp2024!',
    database: process.env.DB_NAME || 'metallurg_app',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',  // MariaDB совместимый с mysql
    charset: 'utf8mb4',
    logging: false
  }
};
