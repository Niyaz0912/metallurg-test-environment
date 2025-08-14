const { TechCard, TechCardExecution, TechCardAccess, User } = require('../models');
const { checkTableFields, getAvailableFields } = require('../utils/dbFieldsHelper');

// Проверка прав доступа
const hasManagePermission = (userRole) => userRole === 'master' || userRole === 'admin';
const hasViewPermission = (userRole) => ['master', 'admin', 'employee', 'director'].includes(userRole);

// Автоматическое логирование доступа к техкарте
const logTechCardAccess = async (techCardId, userId, action = 'view') => {
  try {
    await TechCardAccess.create({
      techCardId,
      userId,
      action,
      accessedAt: new Date()
    });
  } catch (error) {
    console.error('Error logging tech card access:', error);
    // Не прерываем основной процесс если логирование не удалось
  }
};

// GET /api/techcards - список всех карт (упрощенный)
const getAllTechCards = async (req, res) => {
  try {
    console.log('📋 Получение всех техкарт...');
    
    // Проверяем доступные поля в БД
    const availableFields = await checkTableFields('tech_cards');
    console.log('🔍 Доступные поля tech_cards:', availableFields);
    
    // Поля которые мы хотим получить (для разных БД)
    const desiredFields = [
      'id', 'productName', 'description', 'drawingUrl', 
      'specifications', 'productionStages', 'createdAt', 'updatedAt',
      'partNumber', 'customer', 'order', 'quantity', 'pdfUrl', 
      'pdfFileSize', 'totalProducedQuantity', 'status', 'priority',
      'plannedEndDate', 'actualEndDate', 'notes', 'createdById'
    ];
    
    // Получаем только доступные поля
    const fieldsToSelect = getAvailableFields(desiredFields, availableFields);
    console.log('✅ Выбираем поля:', fieldsToSelect);
    
    const techCards = await TechCard.findAll({
      attributes: fieldsToSelect,
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`✅ Найдено техкарт: ${techCards.length}`);
    res.json(techCards);
  } catch (error) {
    console.error('❌ Ошибка получения техкарт:', error);
    res.status(500).json({ message: 'Ошибка при получении техкарт' });
  }
};

// GET /api/techcards/:id - конкретная карта с автоматическим логированием
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
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'], required: false },
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

    // 🎯 АВТОМАТИЧЕСКОЕ ЛОГИРОВАНИЕ ПРОСМОТРА
    await logTechCardAccess(id, req.user.userId, 'view');

    res.json(techCard);
  } catch (error) {
    console.error('Get tech card by id error:', error);
    res.status(500).json({ error: 'Ошибка при получении технологической карты' });
  }
};

// POST /api/techcards - создание новой карты (ОБНОВЛЕНО)
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
      description,
      // 🆕 Новые поля
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
      description,
      // 🆕 Новые поля
      priority,
      plannedEndDate: plannedEndDate || null,
      notes,
      createdById: req.user.userId,
      status: 'draft'
    });

    // Получаем созданную карту с включенными данными
    const createdTechCard = await TechCard.findByPk(techCard.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'], required: false }
      ]
    });

    res.status(201).json(createdTechCard);
  } catch (error) {
    console.error('Create tech card error:', error);
    res.status(500).json({ error: 'Ошибка при создании технологической карты' });
  }
};

// PUT /api/techcards/:id - обновление карты (ОБНОВЛЕНО)
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
      description,
      status,
      // 🆕 Новые поля
      priority,
      plannedEndDate,
      actualEndDate,
      notes
    } = req.body;

    // Валидация при обновлении
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
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;

    // 🆕 Обработка новых полей
    if (priority !== undefined) updateData.priority = priority;
    if (plannedEndDate !== undefined) updateData.plannedEndDate = plannedEndDate || null;
    if (actualEndDate !== undefined) updateData.actualEndDate = actualEndDate || null;
    if (notes !== undefined) updateData.notes = notes;

    await techCard.update(updateData);

    // Получаем обновленную карту
    const updatedTechCard = await TechCard.findByPk(id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'], required: false }
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

// POST /api/techcards/:id/executions - добавить выполнение (УПРОЩЕННОЕ)
const addExecution = async (req, res) => {
  try {
    if (!hasViewPermission(req.user.role)) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }

    const { id } = req.params;
    const {
      quantityProduced,
      setupNumber
    } = req.body;

    // Проверяем существование техкарты
    const techCard = await TechCard.findByPk(id);
    if (!techCard) {
      return res.status(404).json({ error: 'Технологическая карта не найдена' });
    }

    // Упрощенная валидация
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

    // Обновляем статистику в техкарте
    await techCard.increment('totalProducedQuantity', { by: parseInt(quantityProduced) });

    // 🎯 ЛОГИРУЕМ КАК РАБОТУ (не просто просмотр)
    await logTechCardAccess(id, req.user.userId, 'work');

    // Получаем созданное выполнение с данными пользователя
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

// 🆕 Обновление URL PDF файла с размером (ОБНОВЛЕНО)
const updatePdfUrl = async (id, pdfUrl, pdfFileSize = null) => {
  try {
    const techCard = await TechCard.findByPk(id);
    
    if (!techCard) {
      throw new Error('Технологическая карта не найдена');
    }

    const updateData = { pdfUrl };
    if (pdfFileSize !== null) {
      updateData.pdfFileSize = pdfFileSize;
    }

    await techCard.update(updateData);
    
    // Возвращаем обновленную техкарту с связанными данными
    const updatedTechCard = await TechCard.findByPk(id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'], required: false }
      ]
    });

    return updatedTechCard;
  } catch (error) {
    console.error('Error updating PDF URL:', error);
    throw error;
  }
};

// GET /api/techcards/:id/accesses - получить историю доступов к техкарте
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
    console.error('Get tech card accesses error:', error);
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

