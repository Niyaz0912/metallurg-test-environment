const { TechCard, TechCardExecution, TechCardAccess, User } = require('../models');
const { checkTableFields, getAvailableFields } = require('../utils/dbFieldsHelper');

// Проверка прав доступа
const hasManagePermission = (userRole) => userRole === 'master' || userRole === 'admin';
const hasViewPermission = (userRole) => ['master', 'admin', 'employee', 'director'].includes(userRole);

// Логирование доступа к техкарте
const logTechCardAccess = async (techCardId, userId, action = 'view') => {
  try {
    await TechCardAccess.create({
      techCardId,
      userId,
      accessType: action, // ✅ ИСПРАВЛЕНО: accessType вместо action
      accessedAt: new Date()
    });
  } catch (error) {
    // Ошибка логирования не влияет на основной процесс
  }
};

// Получить все техкарты
const getAllTechCards = async (req, res) => {
  try {
    const availableFields = await checkTableFields('tech_cards');
    
    // ✅ ИСПРАВЛЕНО: только поля из модели
    const desiredFields = [
      'id', 'customer', 'order', 'productName', 'partNumber', 'quantity', 
      'pdfUrl', 'pdfFileSize', 'totalProducedQuantity', 'status', 'priority',
      'plannedEndDate', 'actualEndDate', 'notes', 'createdById', 'createdAt', 'updatedAt'
    ];
    
    const fieldsToSelect = getAvailableFields(desiredFields, availableFields);

    const techCards = await TechCard.findAll({
      attributes: fieldsToSelect,
      order: [['createdAt', 'DESC']]
    });
    
    res.json(techCards);
  } catch (error) {
    console.error('Get techcards error:', error);
    res.status(500).json({ message: 'Ошибка при получении техкарт' });
  }
};

// Получить техкарту по ID с логированием доступа
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
            { model: User, as: 'executor', attributes: ['id', 'firstName', 'lastName'] }
          ],
          order: [['executedAt', 'DESC']],
          required: false
        },
        { 
          model: User, 
          as: 'creator', 
          attributes: ['id', 'firstName', 'lastName'], 
          required: false 
        },
        {
          model: TechCardAccess,
          as: 'accesses',
          include: [
            { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName'] }
          ],
          order: [['accessedAt', 'DESC']],
          limit: 50,
          required: false
        }
      ]
    });

    if (!techCard) {
      return res.status(404).json({ error: 'Технологическая карта не найдена' });
    }

    await logTechCardAccess(id, req.user.userId, 'view');
    res.json(techCard);
  } catch (error) {
    console.error('Get techcard by id error:', error);
    res.status(500).json({ error: 'Ошибка при получении технологической карты' });
  }
};

// Создать новую техкарту
const createTechCard = async (req, res) => {
  try {
    if (!hasManagePermission(req.user.role)) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }

    const {
      customer,
      order,
      productName,
      partNumber,
      quantity,
      pdfUrl,
      priority = 'medium',
      plannedEndDate,
      notes
    } = req.body;

    // Валидация обязательных полей
    if (!customer || !order || !productName || !quantity) {
      return res.status(400).json({ 
        error: 'Заказчик, номер заказа, название продукта и количество обязательны' 
      });
    }

    if (quantity < 1) {
      return res.status(400).json({ error: 'Количество должно быть больше 0' });
    }

    const techCard = await TechCard.create({
      customer,
      order,
      productName,
      partNumber,
      quantity: parseInt(quantity),
      pdfUrl,
      priority,
      plannedEndDate: plannedEndDate || null,
      notes,
      createdById: req.user.userId,
      status: 'draft'
    });

    const createdTechCard = await TechCard.findByPk(techCard.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'], required: false }
      ]
    });

    res.status(201).json(createdTechCard);
  } catch (error) {
    console.error('Create techcard error:', error);
    res.status(500).json({ error: 'Ошибка при создании технологической карты' });
  }
};

// Обновить техкарту
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
      customer,
      order,
      productName,
      partNumber,
      quantity,
      pdfUrl,
      status,
      priority,
      plannedEndDate,
      actualEndDate,
      notes
    } = req.body;

    // ✅ УПРОЩЕНО: прямое обновление полей
    const updateData = {};
    if (customer !== undefined) updateData.customer = customer;
    if (order !== undefined) updateData.order = order;
    if (productName !== undefined) updateData.productName = productName;
    if (partNumber !== undefined) updateData.partNumber = partNumber;
    if (quantity !== undefined) {
      if (quantity < 1) {
        return res.status(400).json({ error: 'Количество должно быть больше 0' });
      }
      updateData.quantity = parseInt(quantity);
    }
    if (pdfUrl !== undefined) updateData.pdfUrl = pdfUrl;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (plannedEndDate !== undefined) updateData.plannedEndDate = plannedEndDate || null;
    if (actualEndDate !== undefined) updateData.actualEndDate = actualEndDate || null;
    if (notes !== undefined) updateData.notes = notes;

    await techCard.update(updateData);

    const updatedTechCard = await TechCard.findByPk(id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'], required: false }
      ]
    });

    res.json(updatedTechCard);
  } catch (error) {
    console.error('Update techcard error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении технологической карты' });
  }
};

// Удаление техкарты
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

    // Проверка активных заданий
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
    console.error('Delete techcard error:', error);
    res.status(500).json({ error: 'Ошибка при удалении технологической карты' });
  }
};

// Добавление выполнения
const addExecution = async (req, res) => {
  try {
    if (!hasViewPermission(req.user.role)) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }

    const { id } = req.params;
    const { quantityProduced, setupNumber } = req.body;

    const techCard = await TechCard.findByPk(id);
    if (!techCard) {
      return res.status(404).json({ error: 'Технологическая карта не найдена' });
    }

    if (!quantityProduced || quantityProduced < 1) {
      return res.status(400).json({ 
        error: 'Количество произведенных деталей обязательно и должно быть больше 0' 
      });
    }

    const execution = await TechCardExecution.create({
      techCardId: id,
      executedById: req.user.userId,
      quantityProduced: parseInt(quantityProduced),
      setupNumber: setupNumber ? parseInt(setupNumber) : 1,
      executedAt: new Date()
    });

    // Обновление счетчика
    await techCard.increment('totalProducedQuantity', { by: parseInt(quantityProduced) });
    await logTechCardAccess(id, req.user.userId, 'work');

    const createdExecution = await TechCardExecution.findByPk(execution.id, {
      include: [
        { model: User, as: 'executor', attributes: ['id', 'firstName', 'lastName'] }
      ]
    });

    res.status(201).json(createdExecution);
  } catch (error) {
    console.error('Add execution error:', error);
    res.status(500).json({ error: 'Ошибка при добавлении выполнения' });
  }
};

// Обновить URL PDF
const updatePdfUrl = async (id, pdfUrl, pdfFileSize = null) => {
  try {
    const techCard = await TechCard.findByPk(id);
    if (!techCard) throw new Error('Технологическая карта не найдена');

    const updateData = { pdfUrl };
    if (pdfFileSize !== null) updateData.pdfFileSize = pdfFileSize;

    await techCard.update(updateData);
    return await TechCard.findByPk(id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'], required: false }
      ]
    });
  } catch (error) {
    throw error;
  }
};

// История доступов
const getTechCardAccesses = async (req, res) => {
  try {
    if (!hasManagePermission(req.user.role)) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }

    const { id } = req.params;
    const accesses = await TechCardAccess.findAll({
      where: { techCardId: id },
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName'] }
      ],
      order: [['accessedAt', 'DESC']],
      limit: 100
    });

    res.json(accesses);
  } catch (error) {
    console.error('Get accesses error:', error);
    res.status(500).json({ error: 'Ошибка при получении истории доступов' });
  }
};

module.exports = {
  getAllTechCards,
  getTechCardById,
  createTechCard,
  updateTechCard,
  deleteTechCard,
  addExecution,
  updatePdfUrl,
  getTechCardAccesses,
  logTechCardAccess
};
