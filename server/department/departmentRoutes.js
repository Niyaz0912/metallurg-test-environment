const express = require('express');
const router = express.Router();
const departmentController = require('./departmentController');

// Получить все департаменты
router.get('/', departmentController.getAllDepartments);

module.exports = router;
