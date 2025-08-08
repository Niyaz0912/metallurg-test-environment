const { TechCard, TechCardExecution, User } = require('../models');

// Проверка прав доступа
const hasManagePermission = (userRole) => userRole === 'master' || userRole === 'admin';
const hasViewPermission = (userRole) => ['master', 'admin', 'employee', 'director'].includes(userRole);

// GET /api/techcards - список всех карт
const getAllTechCards = async (req, res) => {
  try {
    if (!hasViewPermission(req.user.role)) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }

    const techCards = await TechCard.findAll({
      include: [
        { 
          model: TechCardExecution, 
          as: 'executions',
          include: [
            { model: User, as: 'executor', attributes: ['id', 'firstName', 'lastName'] }
          ]
        },
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(techCards);
  } catch (error) {
    console.error('Get all tech cards error:', error);
    res.status(500).json({ error: 'Ошибка при получении технологических карт' });
  }
};

// GET /api/techcards/:id - конкретная карта с выполнениями
const getTechCardById = async (req, res) => {
  try {
    if (!hasViewPermission(req.user.role)) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }

    const { id } = req.params;
    const techCard = await TechCard.findByPk(id, {
      include: [
        { 
          model: TechCardExecution, 
          as: 'executions',
          include: [
            { model: User, as: 'executor', attributes: ['id', 'firstName', 'lastName'] },
            { model: User, as: 'qualityInspector', attributes: ['id', 'firstName', 'lastName'] }
          ],
          order: [['executedAt', 'DESC']]
        },
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] }
      ]
    });

    if (!techCard) {
      return res.status(404).json({ error: 'Технологическая карта не найдена' });
    }

    res.json(techCard);
  } catch (error) {
    console.error('Get tech card by id error:', error);
    res.status(500).json({ error: 'Ошибка при получении технологической карты' });
  }
};

// POST /api/techcards - создание новой карты
const createTechCard = async (req, res) => {
  try {
    if (!hasManagePermission(req.user.role)) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }

    const {
      productName,
      partNumber,
      description,
      drawingUrl,
      specifications,
      productionStages,
      estimatedTimePerUnit,
      notes
    } = req.body;

    // Валидация обязательных полей
    if (!productName) {
      return res.status(400).json({ error: 'Название продукта обязательно' });
    }

    const techCard = await TechCard.create({
      productName,
      partNumber,
      description,
      drawingUrl,
      specifications,
      productionStages,
      estimatedTimePerUnit,
      notes,
      createdById: req.user.userId,
      status: 'draft'
    });

    // Получаем созданную карту с включенными данными
    const createdTechCard = await TechCard.findByPk(techCard.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] }
      ]
    });

    res.status(201).json(createdTechCard);
  } catch (error) {
    console.error('Create tech card error:', error);
    res.status(500).json({ error: 'Ошибка при создании технологической карты' });
  }
};

// PUT /api/techcards/:id - обновление карты
const updateTechCard = async (req, res) => {
  try {
    if (!hasManagePermission(req.user.role)) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }

    const { id } = req.params;
    const techCard = await TechCard.findByPk(id);

    if (!techCard) {
      return res.status(404).json({ error: 'Технологическая карта не найдена' });
    }

    const {
      productName,
      partNumber,
      description,
      drawingUrl,
      specifications,
      productionStages,
      estimatedTimePerUnit,
      notes,
      status
    } = req.body;

    await techCard.update({
      productName,
      partNumber,
      description,
      drawingUrl,
      specifications,
      productionStages,
      estimatedTimePerUnit,
      notes,
      status
    });

    // Получаем обновленную карту
    const updatedTechCard = await TechCard.findByPk(id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] }
      ]
    });

    res.json(updatedTechCard);
  } catch (error) {
    console.error('Update tech card error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении технологической карты' });
  }
};

// DELETE /api/techcards/:id - удаление карты
const deleteTechCard = async (req, res) => {
  try {
    if (!hasManagePermission(req.user.role)) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }

    const { id } = req.params;
    const techCard = await TechCard.findByPk(id);

    if (!techCard) {
      return res.status(404).json({ error: 'Технологическая карта не найдена' });
    }

    // Проверяем, не используется ли карта в активных заданиях
    const { Assignment } = require('../models');
    const activeAssignments = await Assignment.count({
      where: { 
        techCardId: id,
        status: ['assigned', 'in_progress']
      }
    });

    if (activeAssignments > 0) {
      return res.status(400).json({ 
        error: `Нельзя удалить техкарту. Она используется в ${activeAssignments} активных заданиях` 
      });
    }

    await techCard.destroy();
    res.json({ message: 'Технологическая карта удалена успешно' });
  } catch (error) {
    console.error('Delete tech card error:', error);
    res.status(500).json({ error: 'Ошибка при удалении технологической карты' });
  }
};

// POST /api/techcards/:id/executions - добавить выполнение
const addExecution = async (req, res) => {
  try {
    if (!hasViewPermission(req.user.role)) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }

    const { id } = req.params;
    const {
      stageName,
      quantityProduced,
      qualityStatus,
      qualityComment,
      checkedById
    } = req.body;

    // Проверяем существование техкарты
    const techCard = await TechCard.findByPk(id);
    if (!techCard) {
      return res.status(404).json({ error: 'Технологическая карта не найдена' });
    }

    // Валидация
    if (!stageName || !quantityProduced) {
      return res.status(400).json({ 
        error: 'Название этапа и количество обязательны' 
      });
    }

    const execution = await TechCardExecution.create({
      techCardId: id,
      executedById: req.user.userId,
      stageName,
      quantityProduced: parseInt(quantityProduced),
      qualityStatus,
      qualityComment,
      checkedById,
      executedAt: new Date()
    });

    // Обновляем статистику в техкарте
    await techCard.increment('totalProducedQuantity', { by: parseInt(quantityProduced) });

    // Получаем созданное выполнение с данными пользователей
    const createdExecution = await TechCardExecution.findByPk(execution.id, {
      include: [
        { model: User, as: 'executor', attributes: ['id', 'firstName', 'lastName'] },
        { model: User, as: 'qualityInspector', attributes: ['id', 'firstName', 'lastName'] }
      ]
    });

    res.status(201).json(createdExecution);
  } catch (error) {
    console.error('Add execution error:', error);
    res.status(500).json({ error: 'Ошибка при добавлении выполнения' });
  }
};

// Обновление URL чертежа
const updateDrawingUrl = async (id, drawingUrl) => {
  try {
    const techCard = await TechCard.findByPk(id);
    
    if (!techCard) {
      throw new Error('Технологическая карта не найдена');
    }

    await techCard.update({ drawingUrl });
    
    // Возвращаем обновленную техкарту с связанными данными
    const updatedTechCard = await TechCard.findByPk(id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] }
      ]
    });

    return updatedTechCard;
  } catch (error) {
    console.error('Error updating drawing URL:', error);
    throw error;
  }
};

module.exports = {
  getAllTechCards,
  getTechCardById,
  createTechCard,
  updateTechCard,
  deleteTechCard,
  addExecution,
  updateDrawingUrl
};

