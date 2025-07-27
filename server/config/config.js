require('dotenv').config(); // Загружаем переменные из .env

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'default_user',
    password: process.env.DB_PASSWORD || 'default_password',
    database: process.env.DB_NAME || 'default_db',
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
  production: {
    username: process.env.DB_USERNAME || 'prod_user',
    password: process.env.DB_PASSWORD || 'prod_password',
    database: process.env.DB_NAME ? `${process.env.DB_NAME}_production` : 'default_prod_db',
    host: process.env.DB_HOST || 'your_production_host',
    dialect: process.env.DB_DIALECT || 'mysql',
  }
};


