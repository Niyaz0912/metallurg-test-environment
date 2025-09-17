const DatabaseSetup = require('./db-setup');

async function startup() {
  console.log('🚀 === STARTING APPLICATION ===');
  
  try {
    // Выполняем настройку базы данных
    const dbSetup = new DatabaseSetup();
    await dbSetup.setupDatabase();
    
    // Запускаем основное приложение после успешной настройки БД
    console.log('🚀 Starting main server...');
    require('./server.js');
    
  } catch (error) {
    console.error('❌ Application startup failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Запускаем только если этот файл вызван напрямую
if (require.main === module) {
  startup();
}

module.exports = { startup };
