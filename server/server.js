// server.js
require('dotenv').config();

// Проверка обязательных переменных окружения
if (!process.env.JWT_SECRET) {
  console.error('❌ Fatal error: JWT_SECRET is not defined in .env file');
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 3001;

// Настройка CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование запросов
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

async function startServer() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Database connection established');

    if (process.env.NODE_ENV === 'development') {
      // await db.sequelize.sync({ alter: true });
      console.log('🔄 Database models synced');
    }

    // Импортируем роуты
    const departmentRoutes = require('./department/departmentRoutes');
    const userRoutes = require('./users/userRoutes');

    // Ваши модули с контроллерами и роутами
    const taskRoutes = require('./tasks');
    const assignmentRoutes = require('./assignments');
    const techCardRoutes = require('./techCards');
    const productionPlanRoutes = require('./productionPlans');

    // Роуты API
    app.use('/api/departments', departmentRoutes);
    app.use('/api/users', userRoutes);

    app.use('/api/tasks', taskRoutes);
    app.use('/api/assignments', assignmentRoutes);
    app.use('/api/techCards', techCardRoutes);
    app.use('/api/productionPlans', productionPlanRoutes);

    // Тестовый маршрут
    app.get('/api/health', (req, res) => {
      res.json({ 
        status: 'OK',
        database: db.sequelize.config.database,
        time: new Date().toISOString()
      });
    });

    // Обработка 404
    app.use((req, res) => {
      res.status(404).json({ error: 'Route not found' });
    });

    // Обработка ошибок
    app.use((err, req, res, next) => {
      console.error('Server error:', err.stack);
      res.status(500).json({ error: 'Internal Server Error' });
    });

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server startup failed:', err);
    process.exit(1);
  }
}

startServer();
