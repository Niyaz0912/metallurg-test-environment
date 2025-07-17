const { User } = require('./userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
require('dotenv').config(); // для работы с переменными окружения

// Получить всех пользователей (только для админа)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['passwordHash'] } });
    res.json(users);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Регистрация пользователя
exports.register = async (req, res) => {
  try {
    // Валидация
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, password, firstName, lastName, role, phone, masterId } = req.body;

    // Проверка, что пользователь не существует
    const candidate = await User.findOne({ where: { username } });
    if (candidate) return res.status(400).json({ message: 'Пользователь уже существует' });

    // Хэширование пароля
    const passwordHash = await bcrypt.hash(password, 10);

    // Создаем пользователя
    const user = await User.create({
      username, passwordHash, firstName, lastName, role, phone, masterId
    });

    res.status(201).json({ message: 'Пользователь создан', userId: user.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Логин
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.scope('withPassword').findOne({ where: { username } });
    if (!user) return res.status(400).json({ message: 'Неверный логин или пароль' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Неверный логин или пароль' });

    // Создаем JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получить информацию о текущем пользователе (по токену)
exports.getMe = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findByPk(userId, { attributes: { exclude: ['passwordHash'] } });
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
    res.json(user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получение профиля (требуется авторизация)
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // пользователь из middleware аутентификации
    const user = await User.findByPk(userId, { attributes: { exclude: ['passwordHash'] } });
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

    res.json(user);
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
    const transporter = nodemailer.createTransport({
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
    const deleted = await User.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ message: 'Пользователь не найден' });
    res.json({ message: 'Пользователь удалён' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};
