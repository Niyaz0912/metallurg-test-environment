// ✅ Загрузка .env в development
if (process.env.NODE_ENV !== 'production') {
  const path = require('path');
  // Правильный путь к .env файлу в корне проекта
  require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
}

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

// ✅ УПРОЩЕННАЯ И УНИВЕРСАЛЬНАЯ НАСТРОЙКА CORS
const isProduction = process.env.NODE_ENV === 'production';
const isRailway = process.env.RAILWAY_ENVIRONMENT_NAME || process.env.RAILWAY_PROJECT_NAME;

// Определяем допустимые origins
const getAllowedOrigins = () => {
  if (isProduction) {
    return [
      process.env.FRONTEND_URL,
      `https://${process.env.RAILWAY_PROJECT_NAME || 'metallurg'}.up.railway.app`,
      'https://metallurg-test-environment-production.up.railway.app',
      'http://localhost:3001', // для локального тестирования production
      'http://localhost:5173'
    ].filter(Boolean);
  } else {
    return [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8081',
      'http://localhost:19000',
      'http://localhost:19002',
      'http://192.168.1.180:8081',
      'http://192.168.1.180:19000',
      'http://10.0.2.2:8081',
      'capacitor://localhost',
      'ionic://localhost'
    ];
  }
};

app.use(cors({
  origin: function (origin, callback) {
    // Разрешить запросы без origin (мобильные приложения, Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = getAllowedOrigins();
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // ✅ На Railway в production разрешаем все origins для удобства
      if (isRailway && isProduction) {
        console.log(`⚠️ CORS: Разрешен неизвестный origin на Railway: ${origin}`);
        callback(null, true);
      } else if (!isProduction) {
        // В development тоже разрешаем для удобства отладки
        console.log(`⚠️ CORS: Разрешен в development: ${origin}`);
        callback(null, true);
      } else {
        console.log(`❌ CORS блокировка origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// ✅ Обработка preflight запросов
app.options('*', cors());

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

// Загружаем роуты
const departmentRoutes = require('./department/departmentRoutes');
const userRoutes = require('./users/userRoutes');
const assignmentRoutes = require('./assignments/assignmentRoutes');
const taskRoutes = require('./tasks/taskRoutes');
const techCardRoutes = require('./techCards/techCardRoutes');
const productionPlanRoutes = require('./productionPlans/productionPlanRoutes');

// ✅ API роуты
app.use('/api/departments', departmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/techcards', techCardRoutes);
app.use('/api/productionPlans', productionPlanRoutes);

// Health check для Railway
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

// ✅ Railway-специфичный health check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/api/files/test', (req, res) => {
  const uploadsPath = path.join(__dirname, 'uploads');
  
  try {
    const files = fs.readdirSync(uploadsPath);
    res.json({
      message: 'Files API working',
      uploadsPath: uploadsPath,
      filesCount: files.length,
      files: files.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({
      error: 'Cannot read uploads directory',
      message: error.message
    });
  }
});

// API информация
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

// ✅ Frontend статические файлы
const frontendPath = path.join(__dirname, '../../frontend/dist');

if (fs.existsSync(frontendPath)) {
  console.log('🎨 Frontend build found, serving React app');
  app.use(express.static(frontendPath));
} else {
  console.log('⚠️ Frontend build not found');
  if (!isRailway) {
    console.log('📝 Run "cd frontend && npm run build" to create the build');
  }
}

// ✅ 404 для API маршрутов
app.use('/api', (req, res) => {
  res.status(404).json({
    error: 'API Route not found',
    path: req.path,
    method: req.method
  });
});

// ✅ Catch-all handler для React Router
app.get('*', (req, res) => {
  const frontendIndexPath = path.join(frontendPath, 'index.html');
  
  if (fs.existsSync(frontendIndexPath)) {
    res.sendFile(frontendIndexPath);
  } else {
    res.status(404).json({ 
      error: 'Frontend not built',
      railway: !!isRailway,
      message: isRailway ? 'Frontend build missing in deployment' : 'Run: cd frontend && npm run build'
    });
  }
});

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
      console.log(`🌐 Railway: ${isRailway ? 'Yes' : 'No'}`);
      
      if (isRailway) {
        console.log(`🔗 Railway URL: https://${process.env.RAILWAY_PROJECT_NAME || 'app'}.up.railway.app`);
      } else {
        console.log(`🏠 Local URL: http://localhost:${PORT}`);
      }
      
      console.log(`🔧 CORS allowed origins:`, getAllowedOrigins());
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