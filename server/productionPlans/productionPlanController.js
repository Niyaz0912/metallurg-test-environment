// server/productionPlans/productionPlanController.js
const { ProductionPlan } = require('../models');

const getAllProductionPlans = async (req, res) => {
  try {
    const plans = await ProductionPlan.findAll({
      order: [['createdAt', 'DESC']] // Сортировка по дате создания
    });
    res.json(plans);
  } catch (error) {
    console.error('Error fetching production plans:', error);
    res.status(500).json({ error: 'Ошибка при получении планов производства' });
  }
};

const getProductionPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await ProductionPlan.findByPk(id);
    
    if (!plan) {
      return res.status(404).json({ error: 'План производства не найден' });
    }
    
    res.json(plan);
  } catch (error) {
    console.error('Error fetching production plan:', error);
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
      progressPercent = 0,
    } = req.body;

    // Валидация
    if (!customerName || !orderName || !quantity || !deadline) {
      return res.status(400).json({ 
        error: 'Обязательные поля: customerName, orderName, quantity, deadline' 
      });
    }

    const plan = await ProductionPlan.create({
      customerName,
      orderName,
      quantity: parseInt(quantity),
      deadline: new Date(deadline),
      progressPercent: parseInt(progressPercent),
    });

    res.status(201).json(plan);
  } catch (error) {
    console.error('Error creating production plan:', error);
    res.status(500).json({ error: 'Ошибка при создании плана производства' });
  }
};

const updateProductionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      customerName,
      orderName,
      quantity,
      deadline,
      progressPercent,
    } = req.body;

    const plan = await ProductionPlan.findByPk(id);
    
    if (!plan) {
      return res.status(404).json({ error: 'План производства не найден' });
    }

    await plan.update({
      customerName,
      orderName,
      quantity: quantity ? parseInt(quantity) : plan.quantity,
      deadline: deadline ? new Date(deadline) : plan.deadline,
      progressPercent: progressPercent !== undefined ? parseInt(progressPercent) : plan.progressPercent,
    });

    res.json(plan);
  } catch (error) {
    console.error('Error updating production plan:', error);
    res.status(500).json({ error: 'Ошибка при обновлении плана производства' });
  }
};

const deleteProductionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    
    const plan = await ProductionPlan.findByPk(id);
    
    if (!plan) {
      return res.status(404).json({ error: 'План производства не найден' });
    }

    await plan.destroy();
    res.json({ message: 'План производства удален успешно' });
  } catch (error) {
    console.error('Error deleting production plan:', error);
    res.status(500).json({ error: 'Ошибка при удалении плана производства' });
  }
};

module.exports = {
  getAllProductionPlans,
  getProductionPlanById,
  createProductionPlan,
  updateProductionPlan,
  deleteProductionPlan,
};
