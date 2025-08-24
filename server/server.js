require('dotenv').config();

// Проверка обязательных переменных окружения
if (!process.env.JWT_SECRET) {
  console.error('❌ Fatal error: JWT_SECRET is not defined in .env file');
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 3001;

// Создание папки uploads если её нет
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

// Настройка CORS
app.use(cors({
  origin: [
    'http://localhost:5173',   // Веб-версия (Vite)
    'http://localhost:3000',   // Веб-версия (Create React App)
    'http://localhost:8081',   // Expo Metro Bundler
    'http://localhost:19000',  // Expo
    'http://localhost:19002',  // Expo
    'http://192.168.1.180:8081', // Мобильное устройство (Expo Metro Bundler)
    'http://192.168.1.180:19000', // Мобильное устройство (Expo)
    'http://192.168.1.180:19002', // Мобильное устройство (Expo)
    'http://10.0.2.2:8081',    // Android эмулятор (Metro Bundler)
    'http://10.0.2.2:19000',   // Android эмулятор (Expo)
    'http://10.0.2.2:19002',   // Android эмулятор (Expo)
    'http://localhost',        // Общий localhost
    'capacitor://localhost',   // Capacitor
    'ionic://localhost'        // Ionic
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware для парсинга данных
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ ИСПРАВЛЕНИЕ: Статические файлы для загруженных файлов
// Основной роут для прямого доступа к файлам
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ ДОБАВЛЕН: Роут для API доступа к файлам (для фронтенда)
app.use('/api/files/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ ДОБАВЛЕН: Альтернативный роут для всех файлов через API
app.use('/api/files', express.static(path.join(__dirname, 'uploads')));

// ✅ УЛУЧШЕННОЕ ЛОГИРОВАНИЕ ЗАПРОСОВ
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const userAgent = req.get('User-Agent') || 'Unknown';
  const ip = req.ip || req.connection.remoteAddress || 'Unknown IP';
  
  // Отключаем логирование для тестов
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    
    // Детальное логирование в режиме разработки
    if (process.env.NODE_ENV === 'development') {
      console.log(`  📍 IP: ${ip}`);
      console.log(`  🔑 Headers: ${JSON.stringify(req.headers, null, 2)}`);
      
      if (req.body && Object.keys(req.body).length > 0) {
        // Скрываем пароли и токены в логах
        const sanitizedBody = { ...req.body };
        if (sanitizedBody.password) sanitizedBody.password = '[HIDDEN]';
        if (sanitizedBody.token) sanitizedBody.token = '[HIDDEN]';
        if (sanitizedBody.refreshToken) sanitizedBody.refreshToken = '[HIDDEN]';
        
        console.log(`  📦 Body: ${JSON.stringify(sanitizedBody, null, 2)}`);
      }
      
      if (req.query && Object.keys(req.query).length > 0) {
        console.log(`  🔍 Query: ${JSON.stringify(req.query, null, 2)}`);
      }
    }
  }
  
  // Логирование времени ответа
  const startTime = Date.now();
  
  res.on('finish', () => {
    if (process.env.NODE_ENV !== 'test') {
      const duration = Date.now() - startTime;
      const statusColor = res.statusCode >= 400 ? '🔴' : res.statusCode >= 300 ? '🟡' : '🟢';
      console.log(`  ${statusColor} ${res.statusCode} - ${duration}ms`);
    }
  });
  
  next();
});

// Загружаем роуты
const departmentRoutes = require('./department/departmentRoutes');
const userRoutes = require('./users/userRoutes');
const assignmentRoutes = require('./assignments/assignmentRoutes');
const taskRoutes = require('./tasks/taskRoutes');
const techCardRoutes = require('./techCards/techCardRoutes');
const productionPlanRoutes = require('./productionPlans/productionPlanRoutes');

// Регистрируем роуты
app.use('/api/departments', departmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/techcards', techCardRoutes);
app.use('/api/productionPlans', productionPlanRoutes);

// Тестовый маршрут для проверки работоспособности
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database: db.sequelize.config.database || 'sqlite-memory',
    time: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ✅ ДОБАВЛЕН: Тестовый маршрут для проверки доступа к файлам
app.get('/api/files/test', (req, res) => {
  const uploadsPath = path.join(__dirname, 'uploads');
  
  try {
    const files = fs.readdirSync(uploadsPath);
    res.json({
      message: 'Files API working',
      uploadsPath: uploadsPath,
      filesCount: files.length,
      files: files.slice(0, 10), // Показываем первые 10 файлов
      availableRoutes: [
        '/uploads/* - Direct file access',
        '/api/files/uploads/* - API file access',
        '/api/files/* - Alternative API file access'
      ]
    });
  } catch (error) {
    res.status(500).json({
      error: 'Cannot read uploads directory',
      path: uploadsPath,
      message: error.message
    });
  }
});

// ✅ ИСПРАВЛЕН: Корневой маршрут БЕЗ дублирования
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Metallurg App</title>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial; text-align: center; margin: 50px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; margin-bottom: 10px; }
            p { color: #666; margin-bottom: 30px; }
            .section { margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 5px; }
            a { display: inline-block; padding: 12px 25px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 5px; transition: background 0.3s; }
            a:hover { background: #0056b3; }
            .credentials { background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🏭 Metallurg App</h1>
            <p>Система управления металлургическим производством</p>
            
            <div class="section">
                <h3>📱 Доступы к приложению:</h3>
                <p>Фронтенд приложение будет развернут отдельно</p>
                <a href="/api" target="_blank">📚 API Документация</a>
                <a href="/api/health" target="_blank">💚 Статус сервера</a>
                <a href="/api/files/test" target="_blank">📁 Тест файлов</a>
            </div>
            
            <div class="credentials">
                <h3>🔑 Тестовые данные для входа:</h3>
                <p><strong>Логин:</strong> admin</p>
                <p><strong>Пароль:</strong> 123456</p>
                <p><em>Используйте эти данные при подключении фронтенда</em></p>
            </div>
            
            <div class="section">
                <h3>🔗 API Endpoints:</h3>
                <p>Все API маршруты доступны по префиксу <code>/api/</code></p>
                <a href="/api/users" target="_blank">👤 Users</a>
                <a href="/api/departments" target="_blank">🏢 Departments</a>
                <a href="/api/tasks" target="_blank">✅ Tasks</a>
                <a href="/api/techcards" target="_blank">📄 Tech Cards</a>
            </div>
        </div>
    </body>
    </html>
  `);
});

// Маршрут для получения информации об API
app.get('/api', (req, res) => {
  res.json({
    message: 'Metallurg API Server',
    version: '1.0.0',
    endpoints: [
      '/api/health - Server health check',
      '/api/files/test - Files API test',
      '/api/departments - Department management',
      '/api/users - User management and authentication',
      '/api/assignments - Shift assignments management',
      '/api/tasks - Task management',
      '/api/techcards - Technical cards management',
      '/api/productionPlans - Production planning'
    ]
  });
});

// Обработка 404 для API маршрутов
app.use('/api/*', (req, res) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`🔍 API Route not found: ${req.method} ${req.path}`);
  }
  res.status(404).json({
    error: 'API Route not found',
    path: req.path,
    method: req.method,
    // ✅ ДОБАВЛЕНО: Подсказки для файлов
    ...(req.path.includes('/files/') && {
      hint: 'Try these file routes:',
      alternatives: [
        `/uploads${req.path.replace('/api/files/uploads', '')}`,
        `/api/files${req.path.replace('/api/files/uploads', '')}`
      ]
    })
  });
});

// Обработка всех остальных 404
app.use((req, res) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`🔍 Route not found: ${req.method} ${req.path}`);
  }
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// ✅ УЛУЧШЕННАЯ ОБРАБОТКА ОШИБОК
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  // Отключаем детальное логирование ошибок для тестов
  if (process.env.NODE_ENV !== 'test') {
    console.error('\n' + '='.repeat(80));
    console.error('🚨 КРИТИЧЕСКАЯ ОШИБКА СЕРВЕРА');
    console.error('='.repeat(80));
    console.error(`⏰ Время: ${timestamp}`);
    console.error(`🆔 ID ошибки: ${errorId}`);
    console.error(`🌐 URL: ${req.method} ${req.url}`);
    console.error(`📍 IP: ${req.ip || req.connection.remoteAddress || 'Unknown'}`);
    console.error(`👤 User-Agent: ${req.get('User-Agent') || 'Unknown'}`);
    
    // Заголовки запроса (без авторизации)
    const sanitizedHeaders = { ...req.headers };
    if (sanitizedHeaders.authorization) sanitizedHeaders.authorization = '[HIDDEN]';
    if (sanitizedHeaders.cookie) sanitizedHeaders.cookie = '[HIDDEN]';
    console.error(`📋 Headers: ${JSON.stringify(sanitizedHeaders, null, 2)}`);
    
    // Тело запроса (без паролей)
    if (req.body && Object.keys(req.body).length > 0) {
      const sanitizedBody = { ...req.body };
      if (sanitizedBody.password) sanitizedBody.password = '[HIDDEN]';
      if (sanitizedBody.token) sanitizedBody.token = '[HIDDEN]';
      console.error(`📦 Request Body: ${JSON.stringify(sanitizedBody, null, 2)}`);
    }
    
    // Информация об ошибке
    console.error(`❌ Ошибка: ${err.name || 'Unknown Error'}`);
    console.error(`💬 Сообщение: ${err.message || 'No message'}`);
    console.error(`📊 Код статуса: ${err.statusCode || err.status || 500}`);
    
    // Стек ошибки
    if (err.stack) {
      console.error(`📚 Stack Trace:`);
      console.error(err.stack);
    }
    
    // Дополнительная информация для специфических типов ошибок
    if (err.code) {
      console.error(`🔢 Error Code: ${err.code}`);
    }
    
    if (err.sqlMessage) {
      console.error(`🗄️  SQL Error: ${err.sqlMessage}`);
    }
    
    if (err.sql) {
      console.error(`📝 SQL Query: ${err.sql}`);
    }
    
    console.error('='.repeat(80));
    console.error('\n');
  }

  // Специальная обработка для Multer ошибок
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'Файл слишком большой',
      message: 'Максимальный размер файла: 10MB',
      errorId: errorId
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Неверный тип файла',
      message: 'Проверьте формат загружаемого файла',
      errorId: errorId
    });
  }

  // Ошибки базы данных
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Ошибка валидации данных',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Неверные данные',
      errorId: errorId
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Конфликт данных',
      message: 'Запись с такими данными уже существует',
      errorId: errorId
    });
  }

  // JWT ошибки
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Ошибка авторизации',
      message: 'Неверный токен',
      errorId: errorId
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Токен истёк',
      message: 'Необходимо войти в систему заново',
      errorId: errorId
    });
  }

  // Общая обработка ошибок
  const statusCode = err.statusCode || err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.status(statusCode).json({
    error: isProduction ? 'Internal Server Error' : err.name || 'Server Error',
    message: isProduction ? 'Что-то пошло не так. Попробуйте позже.' : err.message || 'Unknown error',
    errorId: errorId,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: {
        url: req.url,
        method: req.method,
        timestamp: timestamp
      }
    })
  });
});

async function startServer() {
  try {
    // Подключение к базе данных
    await db.sequelize.authenticate();
    console.log('✅ Database connection established');

    // Синхронизация моделей в режиме разработки
    if (process.env.NODE_ENV === 'development') {
      try {
        // ✅ Временно отключаем sync для предотвращения дублирования индексов
        // await db.sequelize.sync({ alter: true });
        console.log('🔄 Database sync disabled (preventing key duplication)');
        console.log('🔄 Database models synced');
      } catch (syncError) {
        console.warn('⚠️  Database sync warning:', syncError.message);
      }
    }

    console.log('🔗 API routes registration completed');

    // Запуск сервера
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`💾 Database: ${db.sequelize.config.database || 'sqlite-memory'}`);
      console.log(`📁 Uploads directory: ${uploadsDir}`);
      
      // ✅ ДОБАВЛЕНО: Информация о файловых роутах
      console.log(`📄 File routes:`);
      console.log(`   Direct: http://localhost:${PORT}/uploads/filename.pdf`);
      console.log(`   API: http://localhost:${PORT}/api/files/uploads/filename.pdf`);
      console.log(`   Alt: http://localhost:${PORT}/api/files/filename.pdf`);
      console.log(`   Test: http://localhost:${PORT}/api/files/test`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n🛑 ${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        console.log('📡 HTTP server closed');

        try {
          await db.sequelize.close();
          console.log('💾 Database connection closed');
        } catch (error) {
          console.error('❌ Error closing database:', error);
        }

        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    // Обработчики для graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (err) {
    console.error('❌ Server startup failed:', err);
    console.error('Stack trace:', err.stack);
    process.exit(1);
  }
}

// ✅ УЛУЧШЕННАЯ ОБРАБОТКА НЕПЕРЕХВАЧЕННЫХ ОШИБОК
process.on('unhandledRejection', (reason, promise) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error('\n' + '!'.repeat(60));
    console.error('🚨 UNHANDLED PROMISE REJECTION');
    console.error('!'.repeat(60));
    console.error('⏰ Time:', new Date().toISOString());
    console.error('🎯 Promise:', promise);
    console.error('❌ Reason:', reason);
    console.error('📚 Stack:', reason?.stack || 'No stack trace');
    console.error('!'.repeat(60));
    console.error('\n');
  }
});

process.on('uncaughtException', (error) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error('\n' + '!'.repeat(60));
    console.error('🚨 UNCAUGHT EXCEPTION');
    console.error('!'.repeat(60));
    console.error('⏰ Time:', new Date().toISOString());
    console.error('❌ Error:', error.message);
    console.error('📚 Stack:', error.stack);
    console.error('!'.repeat(60));
    console.error('\n');
  }
  process.exit(1);
});

// ✅ ДОБАВЛЕНА ПРОВЕРКА СРЕДЫ
// Запускаем сервер только если не в тестовом окружении
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

// ✅ ЭКСПОРТИРУЕМ APP ДЛЯ ТЕСТОВ
module.exports = app;
