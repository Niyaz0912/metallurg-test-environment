// server/productionPlans/productionPlanController.js
const { ProductionPlan, Assignment } = require('../models');

// Проверка прав доступа
const hasManagePermission = (userRole) => userRole === 'master' || userRole === 'admin';
const hasViewPermission = (userRole) => ['master', 'admin', 'employee', 'director'].includes(userRole);

// Получить все планы производства
const getAllProductionPlans = async (req, res) => {
  try {
    if (!hasViewPermission(req.user.role)) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }

    const plans = await ProductionPlan.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(plans);
  } catch (error) {
    console.error('Get production plans error:', error);
    res.status(500).json({ error: 'Ошибка при получении планов производства' });
  }
};

// Получить план по ID
const getProductionPlanById = async (req, res) => {
  try {
    if (!hasViewPermission(req.user.role)) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }

    const { id } = req.params;
    const plan = await ProductionPlan.findByPk(id, {
      include: [
        { 
          model: Assignment, 
          as: 'assignments', 
          attributes: ['id', 'status', 'actualQuantity'],
          required: false 
        }
      ]
    });
    
    if (!plan) {
      return res.status(404).json({ error: 'План производства не найден' });
    }
    
    res.json(plan);
  } catch (error) {
    console.error('Get production plan error:', error);
    res.status(500).json({ error: 'Ошибка при получении плана производства' });
  }
};

// Создать план производства
const createProductionPlan = async (req, res) => {
  try {
    if (!hasManagePermission(req.user.role)) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }

    const {
      customerName,
      orderName,
      quantity,
      deadline,
      techCardId,
      priority = 1,
      notes
    } = req.body;

    // Валидация обязательных полей
    if (!customerName || !orderName || !quantity || !deadline) {
      return res.status(400).json({ 
        error: 'Обязательные поля: customerName, orderName, quantity, deadline' 
      });
    }

    if (quantity < 1) {
      return res.status(400).json({ error: 'Количество должно быть больше 0' });
    }

    const plan = await ProductionPlan.create({
      customerName,
      orderName,
      quantity: parseInt(quantity),
      deadline: new Date(deadline),
      techCardId: techCardId || null,
      priority: parseInt(priority),
      notes,
      // ✅ НЕ устанавливаем progressPercent - он вычисляется автоматически в хуке
      completedQuantity: 0,
      status: 'planned'
    });

    res.status(201).json(plan);
  } catch (error) {
    console.error('Create production plan error:', error);
    res.status(500).json({ error: 'Ошибка при создании плана производства' });
  }
};

// Обновить план производства
const updateProductionPlan = async (req, res) => {
  try {
    if (!hasManagePermission(req.user.role)) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }

    const { id } = req.params;
    const {
      customerName,
      orderName,
      quantity,
      deadline,
      techCardId,
      priority,
      notes,
      status
    } = req.body;

    const plan = await ProductionPlan.findByPk(id);
    if (!plan) {
      return res.status(404).json({ error: 'План производства не найден' });
    }

    // ✅ ИСПРАВЛЕНО: используем все поля модели
    const updateData = {};
    if (customerName !== undefined) updateData.customerName = customerName;
    if (orderName !== undefined) updateData.orderName = orderName;
    if (quantity !== undefined) {
      if (quantity < 1) {
        return res.status(400).json({ error: 'Количество должно быть больше 0' });
      }
      updateData.quantity = parseInt(quantity);
    }
    if (deadline !== undefined) updateData.deadline = new Date(deadline);
    if (techCardId !== undefined) updateData.techCardId = techCardId;
    if (priority !== undefined) updateData.priority = parseInt(priority);
    if (notes !== undefined) updateData.notes = notes;
    if (status !== undefined) updateData.status = status;

    await plan.update(updateData);
    res.json(plan);
  } catch (error) {
    console.error('Update production plan error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении плана производства' });
  }
};

// Удалить план производства
const deleteProductionPlan = async (req, res) => {
  try {
    if (!hasManagePermission(req.user.role)) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }

    const { id } = req.params;
    const plan = await ProductionPlan.findByPk(id);
    
    if (!plan) {
      return res.status(404).json({ error: 'План производства не найден' });
    }

    // ✅ ДОБАВЛЕНО: проверка связанных активных заданий
    const activeAssignments = await Assignment.count({
      where: { 
        productionPlanId: id,
        status: ['assigned', 'in_progress']
      }
    });

    if (activeAssignments > 0) {
      return res.status(400).json({ 
        error: `Нельзя удалить план. К нему привязано ${activeAssignments} активных заданий` 
      });
    }

    await plan.destroy();
    res.json({ message: 'План производства удален успешно' });
  } catch (error) {
    console.error('Delete production plan error:', error);
    res.status(500).json({ error: 'Ошибка при удалении плана производства' });
  }
};

// ✅ ДОБАВЛЕНО: обновление прогресса выполнения
const updatePlanProgress = async (req, res) => {
  try {
    if (!hasManagePermission(req.user.role)) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }

    const { id } = req.params;
    const { completedQuantity } = req.body;

    const plan = await ProductionPlan.findByPk(id);
    if (!plan) {
      return res.status(404).json({ error: 'План производства не найден' });
    }

    if (completedQuantity < 0 || completedQuantity > plan.quantity) {
      return res.status(400).json({ 
        error: 'Выполненное количество должно быть от 0 до общего количества' 
      });
    }

    // Обновляем количество - progressPercent и status обновятся автоматически в хуке
    await plan.update({ completedQuantity: parseInt(completedQuantity) });
    
    res.json(plan);
  } catch (error) {
    console.error('Update plan progress error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении прогресса' });
  }
};

module.exports = {
  getAllProductionPlans,
  getProductionPlanById,
  createProductionPlan,
  updateProductionPlan,
  deleteProductionPlan,
  updatePlanProgress  // ✅ НОВЫЙ метод
};

