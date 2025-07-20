const { body, validationResult } = require('express-validator');

// Правила валидации для регистрации пользователя
const registerValidationRules = () => [
  body('username')
    .isLength({ min: 3, max: 150 }).withMessage('Имя пользователя должно быть от 3 до 150 символов')
    .matches(/^[a-zA-Z0-9@._+-]+$/).withMessage('Имя пользователя содержит недопустимые символы'),
  body('password')
    .isLength({ min: 6 }).withMessage('Пароль должен быть не менее 6 символов'),
  body('firstName')
    .notEmpty().withMessage('Имя обязательно'),
  body('lastName')
    .notEmpty().withMessage('Фамилия обязательна'),
  body('departmentId')
    .isInt({ min: 1 }).withMessage('Необходимо выбрать отдел')
    .notEmpty().withMessage('Отдел обязателен'),
];

// Middleware для обработки результата валидации
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  registerValidationRules,
  validate,
};