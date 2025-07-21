require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models');
const { authMiddleware } = require('./users/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3001;

// Улучшенная настройка CORS
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    // Добавьте другие допустимые домены при необходимости
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false
};

app.use(cors(corsOptions));

// Для предварительных OPTIONS запросов
app.options('*', cors(corsOptions));

// Парсинг JSON и URL-encoded данных
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование входящих запросов
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Проверка подключения к БД
db.sequelize.authenticate()
  .then(() => console.log('Database connection established'))
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

// Синхронизация моделей (только для разработки)
if (process.env.NODE_ENV === 'development') {
  db.sequelize.sync({ alter: true })
    .then(() => console.log('Database synced'))
    .catch(err => console.error('Database sync error:', err));
}

// Роуты
app.use('/api/users', require('./users/userRoutes'));
app.use('/api/departments', require('./department/departmentRoutes'));

// Маршрут для проверки авторизации
app.get('/api/check-auth', authMiddleware, (req, res) => {
  res.json({ 
    authenticated: true,
    user: req.user 
  });
});

// Проверка работы сервера
app.get('/', (req, res) => {
  res.json({ 
    message: 'Server is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Обработка 404
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.path 
  });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS configured for: ${corsOptions.origin.join(', ')}`);
});

