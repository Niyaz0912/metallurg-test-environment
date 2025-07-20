const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Подключаем все пользовательские роуты
const userRoutes = require('./users/userRoutes');
app.use('/api/users', userRoutes);

// Подключаем роуты департаментов
const departmentRoutes = require('./department/departmentRoutes');
app.use('/api/departments', departmentRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
