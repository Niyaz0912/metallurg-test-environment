require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 3001;

// Проверка подключения к БД
db.sequelize.authenticate()
  .then(() => console.log('Database connection established'))
  .catch(err => console.error('Database connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Роуты
app.use('/api/users', require('./users/userRoutes'));
app.use('/api/departments', require('./department/departmentRoutes'));

// Проверка работы сервера
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Проверка моделей (временный маршрут для отладки)
app.get('/check-models', async (req, res) => {
  try {
    const departments = await db.Department.findAll();
    res.json({
      models: Object.keys(db).filter(k => !['sequelize', 'Sequelize'].includes(k)),
      departments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});