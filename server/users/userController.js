const db = require('../models');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
require('dotenv').config();

// Получить всех пользователей (только для админа)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await db.User.findAll({
      attributes: { exclude: ['passwordHash'] },
      include: {
        model: db.Department,
        as: 'department',
        attributes: ['id', 'name']
      }
    });
    res.json(users);
  } catch (e) {
    console.error('Get all users error:', e);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Регистрация пользователя
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      username, 
      password, 
      firstName, 
      lastName, 
      role, 
      phone, 
      masterId, 
      departmentId, 
      position // ✅ ДОБАВЛЕНО: поле position
    } = req.body;

    // Проверка существования отдела
    const department = await db.Department.findByPk(departmentId);
    if (!department) {
      return res.status(400).json({ message: 'Указанный отдел не существует' });
    }

    // Проверка существования пользователя
    const existingUser = await db.User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким именем уже существует' });
    }

    // ✅ УПРОЩЕНО: для тестовой среды сохраняем пароль как есть
    const passwordHash = password;

    // Создание пользователя
    const user = await db.User.create({
      username,
      passwordHash,
      firstName,
      lastName,
      role,
      phone,
      masterId,
      departmentId,
      position // ✅ ДОБАВЛЕНО
    });

    // Не возвращаем хэш пароля в ответе
    const userResponse = user.get({ plain: true });
    delete userResponse.passwordHash;

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      user: userResponse
    });

  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({
      message: 'Произошла ошибка при регистрации',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ УПРОЩЕННЫЙ логин для тестовой среды
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }

    const user = await db.User.unscoped().findOne({
      where: { username },
      include: [{ model: db.Department, as: 'department' }],
      attributes: { include: ['passwordHash'] }
    });

    if (!user) {
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }

    // ✅ УПРОЩЕННАЯ проверка пароля для тестов
    const passwordValid = password === user.passwordHash;
    
    if (!passwordValid) {
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }

    // Генерация JWT токена
    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role, 
        username: user.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        position: user.position, // ✅ ДОБАВЛЕНО
        department: user.department
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получить информацию о текущем пользователе
exports.getMe = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await db.User.findByPk(userId, {
      include: [
        {
          model: db.Department,
          as: 'department',
          attributes: ['id', 'name'],
          required: false
        }
      ],
      attributes: ['id', 'username', 'firstName', 'lastName', 'role', 'position', 'departmentId'] // ДОБАВЛЕНО: username
    });

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const userData = {
      id: user.id,
      username: user.username, // ДОБАВЛЕНО: username
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      position: user.position,
      departmentId: user.departmentId,
      department: user.department 
        ? { id: user.department.id, name: user.department.name }
        : null
    };

    // ИЗМЕНЕНО: возвращаем данные пользователя напрямую, а не обернутыми в объект
    res.json(userData);
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};


// Обновление пользователя (только для админа)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      username, 
      firstName, 
      lastName, 
      role, 
      phone, 
      masterId, 
      departmentId, 
      position, // ✅ ДОБАВЛЕНО
      password 
    } = req.body;

    const user = await db.User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const updateData = {
      username,
      firstName,
      lastName,
      role,
      phone,
      masterId,
      departmentId,
      position // ✅ ДОБАВЛЕНО
    };

    // Если в запросе есть пароль, добавляем его
    if (password) {
      updateData.passwordHash = password;
    }

    await user.update(updateData);

    // Получаем обновленного пользователя
    const updatedUser = await db.User.findByPk(id, {
      attributes: { exclude: ['passwordHash'] },
      include: {
        model: db.Department,
        as: 'department',
        attributes: ['id', 'name']
      }
    });

    res.json({ 
      message: 'Пользователь успешно обновлен', 
      user: updatedUser 
    });

  } catch (e) {
    console.error('Update user error:', e);
    res.status(500).json({ message: 'Ошибка сервера при обновлении пользователя' });
  }
};

// Удаление пользователя (только для админа)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.User.destroy({ where: { id } });
    
    if (!deleted) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    res.json({ message: 'Пользователь удалён' });
  } catch (e) {
    console.error('Delete user error:', e);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Обновление роли пользователя
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['employee', 'master', 'director', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Недопустимая роль' });
    }

    const [updated] = await db.User.update(
      { role },
      { where: { id } }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json({ message: 'Роль успешно обновлена' });
  } catch (e) {
    console.error('Update role error:', e);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

