// department/departmentRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('./departmentController');
const { authMiddleware } = require('../users/authMiddleware');

// Проверка прав администратора
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'Admin access required'
    });
  }
  next();
};

// Маршруты
router.get('/', authMiddleware, controller.getAllDepartments);
router.get('/:id', controller.getDepartment);
router.post('/', authMiddleware, adminOnly, controller.createDepartment);
router.put('/:id', authMiddleware, adminOnly, controller.updateDepartment);
router.delete('/:id', authMiddleware, adminOnly, controller.deleteDepartment);

module.exports = router;