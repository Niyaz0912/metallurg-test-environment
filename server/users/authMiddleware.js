// users/authMiddleware.js
const jwt = require('jsonwebtoken');
const db = require('../models');

// Middleware для проверки аутентификации
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader); // Отладка

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'No valid authorization header provided' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'No token provided' 
      });
    }

    console.log('Verifying token...'); // Отладка
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded); // Отладка
    
    // Проверяем существование пользователя в БД
    const user = await db.User.findByPk(decoded.userId, {
      attributes: ['id', 'role', 'departmentId', 'firstName', 'lastName'] // Добавляем имя для отладки
    });
    
    console.log('Found user in middleware:', user ? {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      departmentId: user.departmentId
    } : 'null'); // Отладка
    
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
    console.error('Auth middleware error:', err); // Отладка
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Invalid token',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Middleware для проверки ролей
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    console.log('Role check:', { 
      userRole: req.user?.role, 
      allowedRoles 
    }); // Отладка

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
