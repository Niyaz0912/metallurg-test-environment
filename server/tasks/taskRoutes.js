const express = require('express');
const router = express.Router();
const taskController = require('./taskController');

router.get('/', taskController.getAllTasks);
router.post('/', taskController.createTask);

module.exports = router;
