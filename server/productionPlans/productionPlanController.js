const { ProductionPlan } = require('../models');

const getAllProductionPlans = async (req, res) => {
  try {
    const plans = await ProductionPlan.findAll();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении плана производства' });
  }
};

const createProductionPlan = async (req, res) => {
  try {
    const {
      customerName,
      orderName,
      quantity,
      deadline,
      progressPercent,
    } = req.body;

    const plan = await ProductionPlan.create({
      customerName,
      orderName,
      quantity,
      deadline,
      progressPercent,
    });

    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при создании плана производства' });
  }
};

module.exports = {
  getAllProductionPlans,
  createProductionPlan,
};
