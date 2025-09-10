const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 3001;

// Проверка JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is required');
  process.exit(1);
}

// CORS
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Создание папки uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Статика для загрузок
app.use('/uploads', express.static(uploadsDir));
app.use('/api/files/uploads', express.static(uploadsDir));
app.use('/api/files', express.static(uploadsDir));

// Импорт роутов
const departmentRoutes = require('./department/departmentRoutes');
const userRoutes = require('./users/userRoutes');
const assignmentRoutes = require('./assignments/assignmentRoutes');
const taskRoutes = require('./tasks/taskRoutes');
const techCardRoutes = require('./techCards/techCardRoutes');
const productionPlanRoutes = require('./productionPlans/productionPlanRoutes');

// API маршруты с префиксом /api (для веб)
app.use('/api/departments', departmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/techcards', techCardRoutes);
app.use('/api/productionPlans', productionPlanRoutes);

// API маршруты БЕЗ префикса /api (для мобайл)
app.use('/departments', departmentRoutes);
app.use('/users', userRoutes);
app.use('/assignments', assignmentRoutes);
app.use('/tasks', taskRoutes);
app.use('/techcards', techCardRoutes);
app.use('/productionPlans', productionPlanRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    environment: process.env.NODE_ENV || 'development',
    time: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Metallurg API',
    timestamp: new Date().toISOString()
  });
});

// Раздача фронтенда
const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'dist');
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  if (fs.existsSync(frontendBuildPath)) {
    console.log('🎨 Serving React app from:', frontendBuildPath);
    app.use(express.static(frontendBuildPath));
    
    // SPA fallback - ТОЛЬКО для не-API запросов
    app.use((req, res, next) => {
      // Пропускаем все API запросы
      if (req.url.startsWith('/api/') || 
          req.url.startsWith('/assignments') || 
          req.url.startsWith('/users') || 
          req.url.startsWith('/techcards') || 
          req.url.startsWith('/productionPlans') || 
          req.url.startsWith('/tasks') ||
          req.url.startsWith('/departments') ||
          req.url.startsWith('/health')) {
        return res.status(404).json({ error: 'API endpoint not found' });
      }
      
      // Для всех остальных - отдаём React
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    });
  } else {
    console.log('⚠️ Frontend build not found');
  }
}

// Обработка ошибок
app.use((err, req, res, next) => {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    console.error('🚨 Server Error:', err.message);
    console.error('Stack:', err.stack);
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please login again'
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    error: isProd ? 'Internal Server Error' : err.message,
    message: isProd ? 'Something went wrong' : err.stack
  });
});

async function startServer() {
  try {
    console.log(`🔍 Environment: ${process.env.NODE_ENV || 'development'}`);

    await db.sequelize.authenticate();
    console.log('✅ Database connected');

    if (isProduction) {
      console.log('🔄 Syncing database...');
      await db.sequelize.sync();
      console.log('✅ Database synced');
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      if (process.env.RAILWAY_PROJECT_NAME) {
        console.log(`🔗 Railway URL: https://${process.env.RAILWAY_PROJECT_NAME}.up.railway.app`);
      }
      console.log('✅ API available at:');
      console.log('   📱 Mobile: /assignments, /users, /techcards');
      console.log('   🌐 Web: /api/assignments, /api/users, /api/techcards');
    });

  } catch (err) {
    console.error('❌ Server startup failed:', err.message);
    process.exit(1);
  }
}

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`🛑 ${signal} received. Shutting down...`);
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;





