// users/authMiddleware.js
const jwt = require('jsonwebtoken');
const db = require('../models');

// Middleware для проверки аутентификации
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Проверяем существование пользователя в БД
    const user = await db.User.findByPk(decoded.userId, {
      attributes: ['id', 'role', 'departmentId'] // Загружаем только нужные поля
    });
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'User not found' 
      });
    }

    // Добавляем полную информацию о пользователе
    req.user = {
      userId: user.id,
      role: user.role,
      departmentId: user.departmentId
    };
    
    next();
  } catch (err) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Invalid token' 
    });
  }
};

// Middleware для проверки ролей
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to access this resource'
      });
    }
    next();
  };
};

module.exports = { authMiddleware, roleMiddleware };