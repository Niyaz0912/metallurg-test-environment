const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Цвета для логов
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const runCommand = (command, description) => {
  log(`🔄 ${description}...`, 'blue');
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    log(`✅ ${description} - успешно`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} - ошибка: ${error.message}`, 'red');
    return false;
  }
};

const checkEnvironment = () => {
  const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID;
  const isProduction = process.env.NODE_ENV === 'production';
  
  log(`🌍 Окружение: ${isRailway ? 'Railway' : 'Локальное'}`, 'yellow');
  log(`🔧 Режим: ${isProduction ? 'Production' : 'Development'}`, 'yellow');
  
  return { isRailway, isProduction };
};

const installDependencies = () => {
  log('📦 Установка зависимостей...', 'blue');
  
  // Корневые зависимости
  runCommand('npm install', 'Установка корневых зависимостей');
  
  // Backend зависимости
  if (fs.existsSync('./server')) {
    runCommand('cd server && npm install', 'Установка зависимостей backend');
  }
  
  // Frontend зависимости
  if (fs.existsSync('./frontend')) {
    runCommand('cd frontend && npm install', 'Установка зависимостей frontend');
  }
};

const setupDatabase = async () => {
  const { isRailway, isProduction } = checkEnvironment();
  
  log('🗄️ Настройка базы данных...', 'blue');
  
  // Проверяем наличие переменных БД
  const dbVars = {
    host: process.env.MYSQLHOST || process.env.DB_HOST,
    user: process.env.MYSQLUSER || process.env.DB_USERNAME,
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
    database: process.env.MYSQLDATABASE || process.env.DB_NAME,
    port: process.env.MYSQLPORT || process.env.DB_PORT
  };
  
  if (!dbVars.host || !dbVars.user || !dbVars.password) {
    log('⚠️ Переменные базы данных не найдены. Пропускаем миграции...', 'yellow');
    return false;
  }
  
  log(`🔗 Подключаемся к БД: ${dbVars.host}:${dbVars.port}`, 'blue');
  
  // Устанавливаем sequelize-cli если его нет
  if (!fs.existsSync('./server/node_modules/.bin/sequelize')) {
    runCommand('cd server && npm install --save-dev sequelize-cli', 'Установка Sequelize CLI');
  }
  
  // Выполняем миграции
  const migrateSuccess = runCommand('cd server && npx sequelize-cli db:migrate', 'Выполнение миграций');
  
  if (migrateSuccess) {
    // Загружаем тестовые данные (только в development)
    if (!isProduction) {
      runCommand('cd server && npx sequelize-cli db:seed:all', 'Загрузка тестовых данных');
    }
  }
  
  return migrateSuccess;
};

const buildFrontend = () => {
  const { isProduction } = checkEnvironment();
  
  if (isProduction && fs.existsSync('./frontend')) {
    log('🏗️ Сборка frontend для production...', 'blue');
    return runCommand('cd frontend && npm run build', 'Сборка frontend');
  }
  
  return true;
};

const startServers = () => {
  const { isRailway, isProduction } = checkEnvironment();
  
  if (isRailway && isProduction) {
    log('🚀 Запуск production сервера...', 'green');
    runCommand('node server/server.js', 'Запуск backend сервера');
  } else {
    log('🔧 Режим разработки - используйте npm run dev', 'yellow');
  }
};

// Главная функция
const main = async () => {
  log('🎯 Metallurg Test Environment - Автоматическая настройка', 'green');
  log('=' * 60, 'blue');
  
  try {
    // Проверяем окружение
    checkEnvironment();
    
    // Устанавливаем зависимости
    installDependencies();
    
    // Настраиваем базу данных
    await setupDatabase();
    
    // Собираем frontend для production
    buildFrontend();
    
    // Запускаем серверы (только на Railway)
    if (process.env.RAILWAY_ENVIRONMENT) {
      startServers();
    }
    
    log('🎉 Настройка завершена успешно!', 'green');
    
  } catch (error) {
    log(`💥 Критическая ошибка: ${error.message}`, 'red');
    process.exit(1);
  }
};

// Запускаем если файл вызван напрямую
if (require.main === module) {
  main();
}

module.exports = { main, setupDatabase, installDependencies };
