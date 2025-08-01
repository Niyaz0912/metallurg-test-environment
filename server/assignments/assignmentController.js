const { Assignment } = require('../models');

const getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.findAll();
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении заданий' });
  }
};

const createAssignment = async (req, res) => {
  try {
    const {
      operatorId,
      shiftDate,
      taskDescription,
      machineNumber,
      detailName,
      customerName,
      plannedQuantity,
      actualQuantity,
      techCardId,
    } = req.body;

    const assignment = await Assignment.create({
      operatorId,
      shiftDate,
      taskDescription,
      machineNumber,
      detailName,
      customerName,
      plannedQuantity,
      actualQuantity,
      techCardId,
    });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при создании задания' });
  }
};

module.exports = {
  getAllAssignments,
  createAssignment,
};
