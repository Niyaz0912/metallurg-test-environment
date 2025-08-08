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
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Middleware для парсинга данных
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Статические файлы для загруженных файлов
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Логирование запросов
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

async function startServer() {
  try {
    // Подключение к базе данных
    await db.sequelize.authenticate();
    console.log('✅ Database connection established');

    // Синхронизация моделей в режиме разработки
    if (process.env.NODE_ENV === 'development') {
      try {
        await db.sequelize.sync({ alter: true });
        console.log('🔄 Database models synced');
      } catch (syncError) {
        console.warn('⚠️  Database sync warning:', syncError.message);
      }
    }

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

    console.log('🔗 API routes registration completed');

    // Тестовый маршрут для проверки работоспособности
    app.get('/api/health', (req, res) => {
      res.json({ 
        status: 'OK',
        database: db.sequelize.config.database,
        time: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
      });
    });

    // Маршрут для получения информации об API
    app.get('/api', (req, res) => {
      res.json({
        message: 'Metallurg API Server',
        version: '1.0.0',
        endpoints: [
          '/api/health - Server health check',
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
      res.status(404).json({ 
        error: 'API Route not found',
        path: req.path,
        method: req.method
      });
    });

    // Обработка всех остальных 404
    app.use((req, res) => {
      res.status(404).json({ error: 'Route not found' });
    });

    // Глобальная обработка ошибок
    app.use((err, req, res, next) => {
      console.error('💥 Server error:', err.stack);
      
      // Специальная обработка для Multer ошибок
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ 
          error: 'Файл слишком большой',
          message: 'Максимальный размер файла: 10MB' 
        });
      }

      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ 
          error: 'Неверный тип файла',
          message: 'Проверьте формат загружаемого файла' 
        });
      }

      // Общая обработка ошибок
      const statusCode = err.statusCode || err.status || 500;
      res.status(statusCode).json({ 
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
      });
    });

    // Запуск сервера
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`💾 Database: ${db.sequelize.config.database}`);
      console.log(`📁 Uploads directory: ${uploadsDir}`);
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

// Обработка неперехваченных ошибок
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

startServer();
