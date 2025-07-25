require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models');
const { authMiddleware } = require('./users/authMiddleware');
const departmentRoutes = require('./department/departmentRoutes');
const userRoutes = require('./users/userRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Конфигурация CORS
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование запросов
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Инициализация базы данных
async function initializeDatabase() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Database connection established');

    if (process.env.NODE_ENV === 'development') {
      await db.sequelize.sync({ alter: true });
      console.log('🔄 Database models synced');
    }
  } catch (err) {
    console.error('❌ Database initialization error:', err);
    process.exit(1);
  }
}

// Маршруты API
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);

// Проверка авторизации
app.get('/api/check-auth', authMiddleware, (req, res) => {
  res.json({ 
    authenticated: true,
    user: req.user 
  });
});

// Проверка работы сервера
app.get('/', (req, res) => {
  res.json({ 
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    database: db.sequelize.config.database
  });
});

// Обработка 404
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path,
    method: req.method
  });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('🔥 Server error:', err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Запуск сервера
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 CORS enabled for: ${corsOptions.origin.join(', ')}`);
    console.log(`🛠️ Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch(err => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

