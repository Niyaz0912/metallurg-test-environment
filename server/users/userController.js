const db = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
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

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, firstName, lastName, role, phone, masterId, departmentId } = req.body;

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

    // Хэширование пароля
    const passwordHash = await bcrypt.hash(password, 10);

    // Создание пользователя
    const user = await db.User.create({
      username,
      passwordHash,
      firstName,
      lastName,
      role,
      phone,
      masterId,
      departmentId
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

// Логин - ОБНОВЛЕННАЯ ВЕРСИЯ
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('🔍 Попытка входа:', username);
    
    // Используем scope 'withPassword' для получения хеша
    const user = await db.User.scope('withPassword').findOne({
      where: { username },
      include: [{ model: db.Department, as: 'department' }]
    });

    console.log('👤 Пользователь найден:', user ? user.username : 'НЕТ');

    if (!user) {
      console.log('❌ Пользователь не найден');
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }

    const { passwordHash } = user;
    console.log('🔑 Хеш получен:', passwordHash ? 'ДА' : 'НЕТ');
    
    // Проверка пароля только через bcrypt
    let passwordValid = false;
    
    if (passwordHash && passwordHash.startsWith('$2b$')) {
      try {
        passwordValid = await bcrypt.compare(password, passwordHash);
        console.log('🔒 Результат bcrypt для', username, ':', passwordValid);
      } catch (error) {
        console.error('❌ Ошибка bcrypt:', error);
        passwordValid = false;
      }
    } else {
      console.log('❌ Неправильный формат хеша пароля');
      passwordValid = false;
    }

    if (!passwordValid) {
      console.log('❌ Неверный пароль для:', username);
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }

    console.log('✅ Авторизация успешна для:', username);
    
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

    console.log('🎫 JWT токен создан для пользователя ID:', user.id);

    // Возвращаем данные без passwordHash
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        department: user.department
      }
    });

  } catch (error) {
    console.error('💥 Ошибка в login:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получить информацию о текущем пользователе
exports.getMe = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user.userId, {
      attributes: ['id', 'firstName', 'lastName', 'role', 'position', 'departmentId'],
      include: [{
        model: db.Department,
        as: 'department', // Должно совпадать с ассоциацией в модели
        attributes: ['id', 'name'],
        required: false // LEFT JOIN вместо INNER JOIN
      }]
    });

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Проверка данных
    console.log('Department data:', {
      dbDepartmentId: user.departmentId,
      includedDepartment: user.department
    });

    // Формируем гарантированно правильную структуру ответа
    const response = {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        position: user.position,
        department: user.department 
          ? { id: user.department.id, name: user.department.name }
          : null
      }
    };

    res.json(response);
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получение профиля (требуется авторизация)
exports.getProfileWithAssignments = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await db.User.findByPk(userId, { attributes: { exclude: ['passwordHash'] } });
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

    let assignments;
    if (user.role === 'master') {
      assignments = await db.Assignment.findAll({
        include: ['operator', 'techCard']
      });
    } else {
      assignments = await db.Assignment.findAll({
        where: { operatorId: userId },
        include: ['techCard']
      });
    }

    res.json({ user, assignments });

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Запрос на доступ (отправка письма)
exports.requestAccess = async (req, res) => {
  try {
    const { fullName, employeeId, contact } = req.body;
    if (!fullName || !employeeId || !contact) {
      return res.status(400).json({ message: 'Пожалуйста, заполните все поля' });
    }

    // Настройка Nodemailer (используйте реальные SMTP данные!)
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.IT_SUPPORT_EMAIL,
      subject: `Запрос доступа от ${fullName}`,
      text: `Детали запроса:\n\nФИО: ${fullName}\nТабельный номер: ${employeeId}\nКонтактные данные: ${contact}\n\nДата запроса: ${new Date().toLocaleString()}`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Ваш запрос отправлен. С вами свяжутся в ближайшее время.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Ошибка при отправке запроса' });
  }
};

// Удаление пользователя (только для админа)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.User.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ message: 'Пользователь не найден' });
    res.json({ message: 'Пользователь удалён' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Обновление пользователя (только для админа)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Только админ может менять роли
    if (req.user.currentRole !== 'admin') {
      return res.status(403).json({ message: 'Доступ запрещён' });
    }

    await db.User.update({ role }, { where: { id } });
    res.json({ message: 'Роль обновлена' });
  } catch (e) {
    console.error('Update user error:', e);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// В userController.js
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Проверяем валидность роли
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



