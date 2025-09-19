const db = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AssignmentExcelParser = require('./excelParser');
const { checkTableFields, getAvailableFields } = require('../utils/dbFieldsHelper');

// Настройка multer для Excel файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/assignments');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}_${originalName}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.xlsx', '.xls'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    cb(allowedExtensions.includes(fileExtension) ? null : new Error('Разрешены только Excel файлы'), allowedExtensions.includes(fileExtension));
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

exports.uploadExcelMiddleware = upload.single('excelFile');

// Вспомогательные функции
const hasManagePermission = (userRole) => userRole === 'master' || userRole === 'admin';
const hasViewPermission = (userRole) => ['master', 'admin', 'employee', 'director'].includes(userRole);

// Получить данные для формы создания задания
exports.getFormData = async (req, res) => {
  try {
    if (!hasManagePermission(req.user.role)) {
      return res.status(403).json({ message: 'Доступ запрещён' });
    }

    // Получаем уникальные детали из TechCard
    const products = await db.TechCard.findAll({
      attributes: ['productName'],
      where: { status: 'active' },
      group: ['productName'],
      order: [['productName', 'ASC']]
    });

    // Для каждой детали получаем заказчиков
    const formData = {};
    
    for (const product of products) {
      const customers = await db.TechCard.findAll({
        attributes: ['customer'],
        where: { 
          productName: product.productName,
          status: 'active' 
        },
        group: ['customer'],
        order: [['customer', 'ASC']]
      });
      
      formData[product.productName] = customers.map(c => c.customer);
    }

    res.json({
      products: products.map(p => p.productName),
      productCustomers: formData
    });

  } catch (error) {
    console.error('❌ Get form data error:', error);
    res.status(500).json({ message: 'Ошибка получения данных формы' });
  }
};

// Получить список заданий
exports.getAssignments = async (req, res) => {
  try {
    const user = req.user;

    if (!hasViewPermission(user.role)) {
      return res.status(403).json({ message: 'Доступ запрещён' });
    }

    // Проверяем доступные поля в БД
    const availableFields = await checkTableFields('assignments');
    console.log('🔍 Доступные поля assignments:', availableFields);

    // Поля для разных структур БД  
    const desiredFields = [
      'id', 'operatorId', 'shiftDate', 'taskDescription', 'machineNumber',
      'detailName', 'customerName', 'plannedQuantity', 'actualQuantity',
      'techCardId', 'createdAt', 'updatedAt', 'productionPlanId', 
      'shiftType', 'status', 'startedAt', 'completedAt', 'notes'
    ];

    const fieldsToSelect = getAvailableFields(desiredFields, availableFields);
    console.log('✅ Выбираем поля:', fieldsToSelect);

    const whereCondition = hasManagePermission(user.role) ? {} : { operatorId: user.userId };
    const includeOperator = hasManagePermission(user.role) ? [
      { model: db.User, as: 'operator', attributes: ['id', 'firstName', 'lastName', 'username'] }
    ] : [];

    const assignments = await db.Assignment.findAll({
      attributes: fieldsToSelect,
      where: whereCondition,
      include: [
        ...includeOperator,
        { 
          model: db.TechCard, 
          as: 'techCard', 
          attributes: ['id', 'productName'] 
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    if (!assignments || assignments.length === 0) {
      return res.json({
        message: 'У вас пока нет назначенных заданий',
        assignments: []
      });
    }

    console.log(`✅ Найдено заданий: ${assignments.length}`);
    res.json(assignments);
  } catch (e) {
    console.error('❌ Get assignments error:', e);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Создать задание
// Создать задание
exports.createAssignment = async (req, res) => {
  console.log('🎯 createAssignment ВХОД');
  console.log('📦 req.body:', JSON.stringify(req.body, null, 2));

  try {
    if (!hasManagePermission(req.user.role)) {
      return res.status(403).json({ message: 'Доступ запрещён' });
    }

    const { 
      operatorId, 
      shiftDate, 
      shiftType, 
      taskDescription, 
      machineNumber, 
      detailName, 
      customerName, 
      plannedQuantity, 
      techCardId 
    } = req.body;

    // Базовая валидация
    if (!operatorId || !shiftDate || !shiftType || !taskDescription || !machineNumber) {
      return res.status(400).json({ message: 'Заполните все обязательные поля' });
    }

    if (!['day', 'night'].includes(shiftType)) {
      return res.status(400).json({ message: 'Тип смены должен быть "day" или "night"' });
    }

    // Проверяем существование оператора
    const operator = await db.User.findByPk(operatorId);
    if (!operator) {
      return res.status(404).json({ message: 'Оператор не найден' });
    }

    // ✅ АВТОМАТИЧЕСКИЙ ПОИСК ПРОИЗВОДСТВЕННОГО ПЛАНА
    console.log('🔍 Ищем производственный план для:', { detailName, customerName });
    
    let productionPlan = null;
    
    // 1. Ищем точное совпадение: заказчик + название детали
    if (detailName && customerName) {
      productionPlan = await db.ProductionPlan.findOne({
        where: {
          customerName: customerName,
          orderName: {
            [db.Sequelize.Op.like]: `%${detailName}%`
          },
          status: ['planned', 'in_progress']
        },
        order: [['createdAt', 'DESC']]
      });
      
      if (productionPlan) {
        console.log('✅ Найден план (точное совпадение):', productionPlan.orderName, 'для', productionPlan.customerName);
      }
    }
    
    // 2. Если не найден - ищем любой активный план этого заказчика
    if (!productionPlan && customerName) {
      productionPlan = await db.ProductionPlan.findOne({
        where: {
          customerName: customerName,
          status: ['planned', 'in_progress']
        },
        order: [['createdAt', 'DESC']]
      });
      
      if (productionPlan) {
        console.log('✅ Найден план (по заказчику):', productionPlan.orderName, 'для', productionPlan.customerName);
      }
    }
    
    // 3. Крайний случай - берём любой активный план
    if (!productionPlan) {
      productionPlan = await db.ProductionPlan.findOne({
        where: {
          status: ['planned', 'in_progress']
        },
        order: [['createdAt', 'DESC']]
      });
      
      if (productionPlan) {
        console.log('⚠️ Используем запасной план:', productionPlan.orderName, 'для', productionPlan.customerName);
      }
    }
    
    // 4. Если совсем ничего не найдено - ошибка
    if (!productionPlan) {
      return res.status(404).json({ 
        message: 'Не найден подходящий производственный план. Создайте заказ сначала.',
        details: 'Проверьте, что есть активные планы производства'
      });
    }

    console.log('💾 Создание задания с найденным планом:', {
      operatorId, 
      shiftDate, 
      shiftType, 
      taskDescription, 
      machineNumber, 
      detailName: detailName || 'Не указано',
      customerName: customerName || 'Не указан',
      plannedQuantity: parseInt(plannedQuantity) || 0,
      techCardId: techCardId || 1,
      productionPlanId: productionPlan.id, // ✅ Используем найденный план
      foundPlanInfo: `${productionPlan.orderName} (${productionPlan.customerName})`
    });

    // Создаем задание с автоматически найденным планом
    const assignment = await db.Assignment.create({
      operatorId, 
      shiftDate: new Date(shiftDate), 
      shiftType, 
      taskDescription, 
      machineNumber, 
      detailName: detailName || 'Не указано',
      customerName: customerName || 'Не указан',
      plannedQuantity: parseInt(plannedQuantity) || 0,
      techCardId: techCardId || 1,
      productionPlanId: productionPlan.id, // ✅ КЛЮЧЕВОЕ ИЗМЕНЕНИЕ
      status: 'assigned'
    });

    const createdAssignment = await db.Assignment.findByPk(assignment.id, {
      include: [
        { model: db.User, as: 'operator', attributes: ['id', 'firstName', 'lastName', 'username'] },
        { model: db.TechCard, as: 'techCard', attributes: ['id', 'productName'] },
        { model: db.ProductionPlan, as: 'productionPlan', attributes: ['id', 'orderName', 'customerName'] }
      ]
    });

    console.log('✅ Задание создано успешно с ID:', assignment.id);
    
    res.status(201).json({
      message: 'Задание создано успешно',
      assignment: createdAssignment,
      usedPlan: {
        id: productionPlan.id,
        name: productionPlan.orderName,
        customer: productionPlan.customerName
      }
    });

  } catch (e) {
    console.error('❌ Create assignment error:', e.message);
    console.error('❌ Stack trace:', e.stack);
    
    res.status(500).json({ 
      error: 'Ошибка сервера',
      details: e.message 
    });
  }
};

// Обновить задание
exports.updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await db.Assignment.findByPk(id);

    if (!assignment) {
      return res.status(404).json({ message: 'Задание не найдено' });
    }

    const user = req.user;

    if (hasManagePermission(user.role)) {
      // Мастер/админ могут обновить всё
      const updateData = { ...req.body };
      if (updateData.shiftDate) updateData.shiftDate = new Date(updateData.shiftDate);
      if (updateData.plannedQuantity) updateData.plannedQuantity = parseInt(updateData.plannedQuantity);
      if (updateData.actualQuantity !== undefined) updateData.actualQuantity = parseInt(updateData.actualQuantity);
      // ✅ ИСПРАВЛЕНИЕ: Обрабатываем productionPlanId при обновлении
      if (updateData.productionPlanId) updateData.productionPlanId = parseInt(updateData.productionPlanId);

      await assignment.update(updateData);
    } else if (user.role === 'employee' && assignment.operatorId === user.userId) {
      // Сотрудник может обновить только количество и статус
      const allowedFields = {};
      if (req.body.actualQuantity !== undefined) allowedFields.actualQuantity = parseInt(req.body.actualQuantity);
      if (req.body.status && ['assigned', 'completed'].includes(req.body.status)) allowedFields.status = req.body.status;

      if (Object.keys(allowedFields).length === 0) {
        return res.status(400).json({ message: 'Нет данных для обновления' });
      }

      await assignment.update(allowedFields);
    } else {
      return res.status(403).json({ message: 'Доступ запрещён' });
    }

    const updatedAssignment = await db.Assignment.findByPk(id, {
      include: [
        { model: db.User, as: 'operator', attributes: ['id', 'firstName', 'lastName', 'username'] },
        { model: db.TechCard, as: 'techCard', attributes: ['id', 'productName', 'description'] }
      ]
    });

    res.json({ message: 'Задание обновлено', assignment: updatedAssignment });
  } catch (e) {
    console.error('Update assignment error:', e);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Удалить задание
exports.deleteAssignment = async (req, res) => {
  try {
    if (!hasManagePermission(req.user.role)) {
      return res.status(403).json({ message: 'Доступ запрещён' });
    }

    const { id } = req.params;
    const deleted = await db.Assignment.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ message: 'Задание не найдено' });
    }

    res.json({ message: 'Задание удалено успешно' });
  } catch (e) {
    console.error('Delete assignment error:', e);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Удалить все активные задания
exports.deleteAllActiveAssignments = async (req, res) => {
  try {
    if (!hasManagePermission(req.user.role)) {
      return res.status(403).json({ message: 'Доступ запрещён' });
    }

    const deletedCount = await db.Assignment.destroy({
      where: { status: 'assigned' }
    });

    res.json({ 
      message: `Успешно удалено ${deletedCount} активных заданий`,
      deletedCount 
    });
  } catch (error) {
    console.error('Delete all active assignments error:', error);
    res.status(500).json({ message: 'Ошибка при удалении активных заданий' });
  }
};

// Получить задание по ID
exports.getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await db.Assignment.findByPk(id, {
      include: [
        { model: db.User, as: 'operator', attributes: ['id', 'firstName', 'lastName', 'username'] },
        { model: db.TechCard, as: 'techCard', attributes: ['id', 'productName', 'description'] }
      ]
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Задание не найдено' });
    }

    const user = req.user;
    if (hasManagePermission(user.role) || (assignment.operatorId === user.userId && user.role === 'employee')) {
      return res.json(assignment);
    }

    return res.status(403).json({ message: 'Доступ запрещён' });
  } catch (e) {
    console.error('Get assignment error:', e);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Загрузка из Excel
exports.uploadAssignmentsFromExcel = async (req, res) => {
  try {
    if (!hasManagePermission(req.user.role)) {
      return res.status(403).json({ message: 'Доступ запрещён' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Excel файл не загружен' });
    }

    const parser = new AssignmentExcelParser();
    const results = await parser.parseExcelFile(req.file.path, req.user.userId);

    fs.unlinkSync(req.file.path); // Удаляем файл

    res.json({
      message: 'Обработка Excel файла завершена',
      summary: {
        total: results.success.length + results.errors.length + results.skipped.length,
        created: results.success.length,
        errors: results.errors.length,
        skipped: results.skipped.length
      },
      details: results
    });
  } catch (error) {
    console.error('Excel upload error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Ошибка обработки Excel файла' });
  }
};

// Статистика заданий
exports.getAssignmentStatistics = async (req, res) => {
  try {
    if (!hasManagePermission(req.user.role)) {
      return res.status(403).json({ message: 'Доступ запрещён' });
    }

    const stats = await db.Assignment.findAll({
      attributes: ['status', [db.sequelize.fn('COUNT', '*'), 'count']],
      group: ['status']
    });

    const totalAssignments = await db.Assignment.count();
    const completedToday = await db.Assignment.count({
      where: {
        status: 'completed',
        updatedAt: { [db.sequelize.Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) }
      }
    });

    res.json({
      total: totalAssignments,
      completedToday,
      byStatus: stats.reduce((acc, item) => {
        acc[item.dataValues.status] = parseInt(item.dataValues.count);
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({ message: 'Ошибка получения статистики' });
  }
};

