// ✅ Загрузка .env файла из папки server
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// ✅ ФИКС ДЛЯ RAILWAY - Правильная обработка PORT
const PORT = (() => {
  let port = process.env.PORT;
  
  // Если PORT не установлен, используем 3001
  if (!port) return 3001;
  
  // Если PORT это строка, преобразуем в число
  if (typeof port === 'string') {
    port = parseInt(port, 10);
  }
  
  // Проверяем валидность порта
  if (isNaN(port) || port < 0 || port > 65535) {
    console.warn('⚠️ Invalid PORT, using default 3001');
    return 3001;
  }
  
  return port;
})();

console.log('🔧 Server starting with PORT:', PORT);

// Проверка обязательных переменных окружения
if (!process.env.JWT_SECRET) {
  console.error('❌ Fatal error: JWT_SECRET is not defined');
  console.log('🔍 Current JWT_SECRET:', process.env.JWT_SECRET);
  console.log('📋 NODE_ENV:', process.env.NODE_ENV);
  console.log('📋 PORT:', process.env.PORT);
  process.exit(1);
}

console.log(`🚀 Starting server on port ${PORT}`);
console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔧 PORT value: ${process.env.PORT} (processed as: ${PORT})`);

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const db = require('./models');

const app = express();

// Создание папки uploads если её нет
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

const isProduction = process.env.NODE_ENV === 'production';
const isRailway = process.env.RAILWAY_ENVIRONMENT_NAME || process.env.RAILWAY_PROJECT_NAME;

app.use(cors());

// ✅ ИСПРАВЛЕНИЕ: Обработка preflight запросов с именованным параметром
app.options('*catchall', cors());

// Middleware для парсинга данных
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Статические файлы для загруженных файлов
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/files/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/files', express.static(path.join(__dirname, 'uploads')));

// ✅ ОПТИМИЗИРОВАННОЕ ЛОГИРОВАНИЕ
app.use((req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (!isProduction || process.env.DEBUG_REQUESTS === 'true') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    
    if (!isProduction && req.body && Object.keys(req.body).length > 0) {
      const sanitizedBody = { ...req.body };
      if (sanitizedBody.password) sanitizedBody.password = '[HIDDEN]';
      if (sanitizedBody.token) sanitizedBody.token = '[HIDDEN]';
      console.log(`  📦 Body:`, sanitizedBody);
    }
  }
  
  const startTime = Date.now();
  res.on('finish', () => {
    if (!isProduction || process.env.DEBUG_REQUESTS === 'true') {
      const duration = Date.now() - startTime;
      const statusColor = res.statusCode >= 400 ? '🔴' : res.statusCode >= 300 ? '🟡' : '🟢';
      console.log(`  ${statusColor} ${res.statusCode} - ${duration}ms`);
    }
  });
  
  next();
});

// --- ПРАВИЛЬНЫЙ ПОРЯДОК --- 

// 1. Сначала ВСЕ API-роуты
const departmentRoutes = require('./department/departmentRoutes');
const userRoutes = require('./users/userRoutes');
const assignmentRoutes = require('./assignments/assignmentRoutes');
const taskRoutes = require('./tasks/taskRoutes');
const techCardRoutes = require('./techCards/techCardRoutes');
const productionPlanRoutes = require('./productionPlans/productionPlanRoutes');

app.use('/api/departments', departmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/techcards', techCardRoutes);
app.use('/api/productionPlans', productionPlanRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    environment: process.env.NODE_ENV || 'development',
    railway: !!isRailway,
    database: db.sequelize.config.database || 'sqlite-memory',
    time: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Metallurg API Server',
    version: '1.0.0',
    railway: !!isRailway,
    endpoints: [
      '/api/health - Server health check',
      '/health - Railway health check',
      '/api/departments - Department management',
      '/api/users - User management and authentication',
      '/api/assignments - Shift assignments management',
      '/api/tasks - Task management',
      '/api/techcards - Technical cards management',
      '/api/productionPlans - Production planning'
    ]
  });
});

// 2. Потом Middleware для раздачи статических файлов фронтенда
const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'dist');
if (isProduction || isRailway) {
  if (fs.existsSync(frontendBuildPath)) {
    console.log('🎨 Frontend build found, serving React app from', frontendBuildPath);
    app.use(express.static(frontendBuildPath));
  } else {
    console.log('⚠️ Frontend build not found at', frontendBuildPath);
  }

  // 3. И только в самом конце — Fallback для SPA (отдает index.html для всех остальных GET запросов)
  app.get('*catchall', (req, res) => {
    const frontendIndexPath = path.join(frontendBuildPath, 'index.html');
    if (fs.existsSync(frontendIndexPath)) {
      res.sendFile(frontendIndexPath);
    } else {
      res.status(404).json({
        error: 'Frontend not built',
        message: 'index.html not found in build directory'
      });
    }
  });
}

// ✅ УПРОЩЕННАЯ ОБРАБОТКА ОШИБОК
app.use((err, req, res, next) => {
  const errorId = Date.now().toString(36);
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (!isProduction) {
    console.error('🚨 Ошибка сервера:', err.message);
    console.error('Stack:', err.stack);
  } else {
    console.error(`🚨 Ошибка [${errorId}]:`, err.message);
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'Файл слишком большой',
      message: 'Максимальный размер файла: 10MB'
    });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Ошибка валидации данных',
      message: isProduction ? 'Неверные данные' : err.message
    });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Ошибка авторизации',
      message: 'Необходимо войти в систему заново'
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  
  res.status(statusCode).json({
    error: isProduction ? 'Internal Server Error' : err.name || 'Server Error',
    message: isProduction ? 'Что-то пошло не так. Попробуйте позже.' : err.message,
    ...(process.env.DEBUG === 'true' && { errorId })
  });
});

async function startServer() {
  try {
    // ✅ Подключение к базе данных
    await db.sequelize.authenticate();
    console.log('✅ Database connection established');

    // ✅ Синхронизация только в development
    if (!isProduction) {
      console.log('🔄 Development mode: Database sync disabled');
    }

    // ✅ Запуск сервера
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      
      const isRailway = process.env.RAILWAY_ENVIRONMENT_NAME || process.env.RAILWAY_PROJECT_NAME;
      console.log(`🌐 Railway: ${isRailway ? 'Yes' : 'No'}`);
      
      if (isRailway) {
        console.log(`🔗 Railway URL: https://${process.env.RAILWAY_PROJECT_NAME || 'app'}.up.railway.app`);
      } else {
        console.log(`🏠 Local URL: http://localhost:${PORT}`);
      }
    });

    // ✅ Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`🛑 ${signal} received. Shutting down gracefully...`);
      
      server.close(async () => {
        try {
          await db.sequelize.close();
          console.log('💾 Database connection closed');
        } catch (error) {
          console.error('❌ Error closing database:', error.message);
        }
        process.exit(0);
      });

      setTimeout(() => {
        console.error('❌ Forced shutdown');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (err) {
    console.error('❌ Server startup failed:', err.message);
    process.exit(1);
  }
}

// ✅ ОБРАБОТКА НЕОБРАБОТАННЫХ ОШИБОК
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Promise Rejection:', reason?.message || reason);
});

process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error.message);
  process.exit(1);
});

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
