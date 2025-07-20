const { Department } = require('../models');

// Получить список всех департаментов
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении департаментов' });
  }
};
