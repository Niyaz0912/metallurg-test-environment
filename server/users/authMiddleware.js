const jwt = require('jsonwebtoken');
const db = require('../models');

exports.authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Требуется авторизация',
        details: 'Токен должен быть в формате: Bearer <token>'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId) {
      return res.status(401).json({ 
        message: 'Невалидный токен',
        details: 'Токен не содержит userId'
      });
    }

    // Получаем пользователя из базы по userId из токена
    const user = await db.User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }

    // Записываем в req.user актуальные данные из БД
    req.user = {
      id: user.id,
      role: user.role,
      departmentId: user.departmentId || null,
      currentRole: user.role
    };

    next();

  } catch (err) {
    console.error('Ошибка проверки токена:', err.message);
    return res.status(401).json({
      message: 'Ошибка авторизации',
      details: err.message.includes('expired') ? 'Токен истёк' : 'Невалидный токен'
    });
  }
};


/**
 * Middleware для проверки ролей
 * Принимает массив разрешённых ролей, проверяет роль пользователя, загруженную из БД
 */
exports.roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Требуется авторизация' });
    }

    const userRole = req.user.currentRole || req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: 'Доступ запрещён',
        details: `Требуемые роли: ${allowedRoles.join(', ')}`,
        yourRole: userRole
      });
    }

    next();
  };
};

