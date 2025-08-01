const { Task } = require('../models');

const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении задач' });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, assignedDepartmentId, createdById } = req.body;
    const task = await Task.create({ title, description, assignedDepartmentId, createdById });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при создании задачи' });
  }
};

module.exports = {
  getAllTasks,
  createTask,
};
