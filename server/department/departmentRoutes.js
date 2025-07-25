const express = require('express');
const router = express.Router();
const departmentController = require('./departmentController');
const { authMiddleware } = require('../users/authMiddleware');

// Убедитесь, что departmentController существует и экспортирует нужные методы
console.log(departmentController); // Добавьте для проверки

// Получение всех департаментов
router.get('/', authMiddleware, departmentController.getAllDepartments);

// Получение конкретного департамента
router.get('/:id', authMiddleware, departmentController.getDepartment);

// Создание департамента (только для админов)
router.post(
  '/',
  authMiddleware,
  (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  },
  departmentController.createDepartment // Убедитесь, что этот метод существует
);

// Обновление департамента (только для админов)
router.put(
  '/:id',
  authMiddleware,
  (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  },
  departmentController.updateDepartment
);

// Удаление департамента (только для админов)
router.delete(
  '/:id',
  authMiddleware,
  (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  },
  departmentController.deleteDepartment
);

module.exports = router;