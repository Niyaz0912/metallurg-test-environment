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

// ✅ ОБНОВЛЕННАЯ НАСТРОЙКА CORS для production и development
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL || 'https://metallurg-test-environment-production.up.railway.app',
        'https://metallurg-test-environment-production.up.railway.app'
      ]
    : [
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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/files/uploads', express.static(path.join(__dirname, 'uploads')));
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

// Регистрируем API роуты
app.use('/api/departments', departmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/techcards', techCardRoutes);
app.use('/api/productionPlans', productionPlanRoutes);

// Тестовые API маршруты
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database: db.sequelize.config.database || 'sqlite-memory',
    time: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/files/test', (req, res) => {
  const uploadsPath = path.join(__dirname, 'uploads');
  
  try {
    const files = fs.readdirSync(uploadsPath);
    res.json({
      message: 'Files API working',
      uploadsPath: uploadsPath,
      filesCount: files.length,
      files: files.slice(0, 10),
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

// ✅ НОВОЕ: Обслуживание статических файлов React приложения
const frontendPath = path.join(__dirname, '../frontend/dist');

// Проверяем, существует ли папка с build
if (fs.existsSync(frontendPath)) {
  console.log('🎨 Frontend build found, serving React app');
  app.use(express.static(frontendPath));
} else {
  console.log('⚠️  Frontend build not found at:', frontendPath);
  console.log('📝 Run "cd frontend && npm run build" to create the build');
}

// Обработка 404 для API маршрутов
app.use('/api/*', (req, res) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`🔍 API Route not found: ${req.method} ${req.path}`);
  }
  res.status(404).json({
    error: 'API Route not found',
    path: req.path,
    method: req.method,
    ...(req.path.includes('/files/') && {
      hint: 'Try these file routes:',
      alternatives: [
        `/uploads${req.path.replace('/api/files/uploads', '')}`,
        `/api/files${req.path.replace('/api/files/uploads', '')}`
      ]
    })
  });
});

// ✅ ИСПРАВЛЕНО: Только catch-all handler для React Router (SPA routing)
// ❌ УДАЛЕН проблемный app.get('/', ...) роут
app.get('*', (req, res) => {
  const frontendIndexPath = path.join(frontendPath, 'index.html');
  
  if (fs.existsSync(frontendIndexPath)) {
    res.sendFile(frontendIndexPath);
  } else {
    // Fallback если нет build фронтенда
    res.status(404).json({ 
      error: 'Frontend not built', 
      message: 'Run: cd frontend && npm run build',
      path: frontendIndexPath,
      exists: false
    });
  }
});

// ✅ УЛУЧШЕННАЯ ОБРАБОТКА ОШИБОК
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  if (process.env.NODE_ENV !== 'test') {
    console.error('\n' + '='.repeat(80));
    console.error('🚨 КРИТИЧЕСКАЯ ОШИБКА СЕРВЕРА');
    console.error('='.repeat(80));
    console.error(`⏰ Время: ${timestamp}`);
    console.error(`🆔 ID ошибки: ${errorId}`);
    console.error(`🌐 URL: ${req.method} ${req.url}`);
    console.error(`📍 IP: ${req.ip || req.connection.remoteAddress || 'Unknown'}`);
    console.error(`👤 User-Agent: ${req.get('User-Agent') || 'Unknown'}`);
    
    const sanitizedHeaders = { ...req.headers };
    if (sanitizedHeaders.authorization) sanitizedHeaders.authorization = '[HIDDEN]';
    if (sanitizedHeaders.cookie) sanitizedHeaders.cookie = '[HIDDEN]';
    console.error(`📋 Headers: ${JSON.stringify(sanitizedHeaders, null, 2)}`);
    
    if (req.body && Object.keys(req.body).length > 0) {
      const sanitizedBody = { ...req.body };
      if (sanitizedBody.password) sanitizedBody.password = '[HIDDEN]';
      if (sanitizedBody.token) sanitizedBody.token = '[HIDDEN]';
      console.error(`📦 Request Body: ${JSON.stringify(sanitizedBody, null, 2)}`);
    }
    
    console.error(`❌ Ошибка: ${err.name || 'Unknown Error'}`);
    console.error(`💬 Сообщение: ${err.message || 'No message'}`);
    console.error(`📊 Код статуса: ${err.statusCode || err.status || 500}`);
    
    if (err.stack) {
      console.error(`📚 Stack Trace:`);
      console.error(err.stack);
    }
    
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
    await db.sequelize.authenticate();
    console.log('✅ Database connection established');

    if (process.env.NODE_ENV === 'development') {
      try {
        console.log('🔄 Database sync disabled (preventing key duplication)');
        console.log('🔄 Database models synced');
      } catch (syncError) {
        console.warn('⚠️  Database sync warning:', syncError.message);
      }
    }

    console.log('🔗 API routes registration completed');

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`💾 Database: ${db.sequelize.config.database || 'sqlite-memory'}`);
      console.log(`📁 Uploads directory: ${uploadsDir}`);
      
      console.log(`📄 File routes:`);
      console.log(`   Direct: http://localhost:${PORT}/uploads/filename.pdf`);
      console.log(`   API: http://localhost:${PORT}/api/files/uploads/filename.pdf`);
      console.log(`   Alt: http://localhost:${PORT}/api/files/filename.pdf`);
      console.log(`   Test: http://localhost:${PORT}/api/files/test`);
      
      // ✅ НОВОЕ: Информация о фронтенде
      if (fs.existsSync(frontendPath)) {
        console.log(`🎨 Frontend: http://localhost:${PORT}/`);
        console.log(`📱 React app will be served for all non-API routes`);
      } else {
        console.log(`⚠️  Frontend build not found. Run "cd frontend && npm run build"`);
      }
    });

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

      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (err) {
    console.error('❌ Server startup failed:', err);
    console.error('Stack trace:', err.stack);
    process.exit(1);
  }
}

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

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;

