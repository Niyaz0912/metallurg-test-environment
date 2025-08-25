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
  
  // ✅ ИСПРАВЛЕНО для Railway
  production: {
    // Используем DATABASE_URL от Railway
    use_env_variable: 'DATABASE_URL',
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    
    // Альтернативно можно использовать отдельные переменные:
    /*
    username: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT || 3306,
    dialect: 'mysql',
    */
  }
};
