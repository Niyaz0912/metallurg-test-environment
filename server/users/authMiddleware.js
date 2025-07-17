// server/users/authMiddleware.js
const jwt = require('jsonwebtoken');

/**
 * Middleware для проверки JWT-токена.
 * Сохраняет расшифрованный payload (userId, role) в req.user.
 */
exports.authMiddleware = (req, res, next) => {
  // Проверяем заголовок, берём токен после "Bearer "
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Токен не предоставлен или неверный формат' });
  }
  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role }
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Токен невалиден или истёк' });
  }
};

/**
 * Middleware для проверки роли пользователя.
 * Использовать: roleMiddleware(['admin', 'manager'])
 */
exports.roleMiddleware = (allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Доступ запрещён' });
  }
  next();
};

