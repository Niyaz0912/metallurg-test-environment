const express = require('express');
const router = express.Router();

const userController = require('./userController');
const { authMiddleware, roleMiddleware } = require('./authMiddleware');

// POST /api/users/register — регистрация
router.post('/register', userController.register);

// POST /api/users/login — логин
router.post('/login', userController.login);

// GET /api/users/me — инфо о себе (по токену)
router.get('/me', authMiddleware, userController.getMe);

// GET /api/users — список всех пользователей (только admin)
router.get('/', authMiddleware, roleMiddleware(['admin']), userController.getAllUsers);

// PATCH /api/users/:id/role — обновление роли (только admin)
router.put('/:id', authMiddleware, roleMiddleware(['admin']), userController.updateUser);

// DELETE /api/users/:id — удаление пользователя (только admin)
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), userController.deleteUser);

module.exports = router;
