const jwt = require('jsonwebtoken');

/**
 * Улучшенный middleware для проверки JWT-токена
 */
exports.authMiddleware = async (req, res, next) => {
  try {
    // Проверяем заголовок Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Требуется авторизация',
        details: 'Токен должен быть в формате: Bearer <token>'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Верифицируем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Добавляем проверку наличия обязательных полей
    if (!decoded.userId || !decoded.role) {
      return res.status(401).json({ 
        message: 'Невалидный токен',
        details: 'Токен не содержит необходимых данных'
      });
    }

    // Сохраняем данные пользователя в запросе
    req.user = {
      id: decoded.userId,
      role: decoded.role,
      departmentId: decoded.departmentId || null
    };

    next();
  } catch (err) {
    console.error('Ошибка проверки токена:', err.message);
    
    const response = {
      message: 'Ошибка авторизации',
      details: err.message.includes('expired') 
        ? 'Токен истёк' 
        : 'Невалидный токен'
    };

    return res.status(401).json(response);
  }
};

/**
 * Middleware для проверки ролей с улучшенной обработкой ошибок
 */
exports.roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Требуется авторизация' });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
          message: 'Доступ запрещён',
          details: `Требуемые роли: ${allowedRoles.join(', ')}`,
          yourRole: req.user.role
        });
      }

      next();
    } catch (err) {
      console.error('Ошибка проверки роли:', err);
      return res.status(500).json({ message: 'Ошибка сервера при проверке прав доступа' });
    }
  };
};

