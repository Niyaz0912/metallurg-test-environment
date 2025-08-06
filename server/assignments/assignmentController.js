const db = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AssignmentExcelParser = require('./excelParser');

// Настройка multer для загрузки Excel файлов
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

// ✅ ИСПРАВЛЕНИЕ: Создаем upload с обработкой ошибок
let upload;
try {
  upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      const allowedExtensions = ['.xlsx', '.xls'];
      const fileExtension = path.extname(file.originalname).toLowerCase();
      
      if (allowedExtensions.includes(fileExtension)) {
        cb(null, true);
      } else {
        cb(new Error('Разрешены только Excel файлы (.xlsx, .xls)'), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB лимит
    }
  });
  
  console.log('✅ Multer middleware создан успешно');
} catch (error) {
  console.error('❌ Ошибка создания multer middleware:', error);
  upload = null;
}

// ✅ ИСПРАВЛЕНИЕ: Безопасный экспорт middleware
exports.uploadExcelMiddleware = upload ? upload.single('excelFile') : (req, res, next) => {
  res.status(500).json({ message: 'Загрузка файлов временно недоступна' });
};

// ✅ ИСПРАВЛЕНИЕ: Корректные роли пользователей
const hasManagePermission = (userRole) => {
  return userRole === 'master' || userRole === 'admin';
};

const hasViewPermission = (userRole) => {
  return userRole === 'master' || userRole === 'admin' || userRole === 'employee' || userRole === 'director';
};

// Получить список сменных заданий по роли
exports.getAssignments = async (req, res) => {
  try {
    const user = req.user;

    // ✅ ИСПРАВЛЕНИЕ: Улучшенная проверка прав доступа
    if (!hasViewPermission(user.role)) {
      return res.status(403).json({ message: 'Доступ запрещён' });
    }

    let assignments;
    
    if (hasManagePermission(user.role)) {
      // Мастер и админ видят все задания
      assignments = await db.Assignment.findAll({
        include: [
          { 
            model: db.User, 
            as: 'operator', 
            attributes: ['id', 'firstName', 'lastName', 'username'] 
          },
          { 
            model: db.TechCard, 
            as: 'techCard',
            attributes: ['id', 'productName', 'description']
          }
        ],
        order: [['createdAt', 'DESC']]
      });
    } else {
      // Сотрудник видит только свои задания
      assignments = await db.Assignment.findAll({
        where: { operatorId: user.userId },
        include: [
          { 
            model: db.TechCard, 
            as: 'techCard',
            attributes: ['id', 'productName', 'description']
          }
        ],
        order: [['createdAt', 'DESC']]
      });
    }

    res.json(assignments);
  } catch (e) {
    console.error('Get assignments error:', e);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// ✅ ИСПРАВЛЕНИЕ: Создание задания (мастер и админ)
exports.createAssignment = async (req, res) => {
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

    // ✅ ИСПРАВЛЕНИЕ: Валидация обязательных полей
    if (!operatorId || !shiftDate || !shiftType || !taskDescription || !machineNumber) {
      return res.status(400).json({ 
        message: 'Обязательные поля: operatorId, shiftDate, shiftType, taskDescription, machineNumber' 
      });
    }

    // ✅ ИСПРАВЛЕНИЕ: Проверяем, что оператор существует
    const operator = await db.User.findByPk(operatorId);
    if (!operator) {
      return res.status(404).json({ message: 'Оператор не найден' });
    }

    // ✅ ИСПРАВЛЕНИЕ: Проверяем валидность типа смены
    if (!['day', 'night'].includes(shiftType)) {
      return res.status(400).json({ message: 'Тип смены должен быть "day" или "night"' });
    }

    const assignment = await db.Assignment.create({
      operatorId, 
      shiftDate: new Date(shiftDate), 
      shiftType, 
      taskDescription, 
      machineNumber, 
      detailName: detailName || 'Не указано',
      customerName: customerName || 'Не указан',
      plannedQuantity: parseInt(plannedQuantity) || 0,
      techCardId: techCardId || 1, // Временное значение
      status: 'assigned'
    });

    // Получаем созданное задание с связанными данными
    const createdAssignment = await db.Assignment.findByPk(assignment.id, {
      include: [
        { 
          model: db.User, 
          as: 'operator', 
          attributes: ['id', 'firstName', 'lastName', 'username'] 
        },
        { 
          model: db.TechCard, 
          as: 'techCard',
          attributes: ['id', 'productName', 'description']
        }
      ]
    });

    res.status(201).json({
      message: 'Задание создано успешно',
      assignment: createdAssignment
    });

  } catch (e) {
    console.error('Create assignment error:', e);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// ✅ ИСПРАВЛЕНИЕ: Обновление задания с улучшенной логикой
exports.updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await db.Assignment.findByPk(id);

    if (!assignment) {
      return res.status(404).json({ message: 'Задание не найдено' });
    }

    const user = req.user;

    if (hasManagePermission(user.role)) {
      // Мастер и админ могут обновить все поля
      const updateData = { ...req.body };
      
      // ✅ ИСПРАВЛЕНИЕ: Валидация данных при обновлении
      if (updateData.shiftDate) {
        updateData.shiftDate = new Date(updateData.shiftDate);
      }
      if (updateData.plannedQuantity) {
        updateData.plannedQuantity = parseInt(updateData.plannedQuantity);
      }
      if (updateData.actualQuantity !== undefined) {
        updateData.actualQuantity = parseInt(updateData.actualQuantity);
      }
      if (updateData.shiftType && !['day', 'night'].includes(updateData.shiftType)) {
        return res.status(400).json({ message: 'Тип смены должен быть "day" или "night"' });
      }

      await assignment.update(updateData);
      
      // Получаем обновленное задание с связанными данными
      const updatedAssignment = await db.Assignment.findByPk(id, {
        include: [
          { 
            model: db.User, 
            as: 'operator', 
            attributes: ['id', 'firstName', 'lastName', 'username'] 
          },
          { 
            model: db.TechCard, 
            as: 'techCard',
            attributes: ['id', 'productName', 'description']
          }
        ]
      });

      return res.json({ 
        message: 'Задание обновлено', 
        assignment: updatedAssignment 
      });
    } 

    // ✅ ИСПРАВЛЕНИЕ: Убрана несуществующая роль 'operator'
    if (user.role === 'employee' && assignment.operatorId === user.userId) {
      // Сотрудник может обновить только фактическое количество и статус
      const allowedFields = {};
      
      if (req.body.actualQuantity !== undefined) {
        allowedFields.actualQuantity = parseInt(req.body.actualQuantity);
      }
      
      if (req.body.status !== undefined) {
        if (!['assigned', 'completed'].includes(req.body.status)) {
          return res.status(400).json({ message: 'Статус должен быть "assigned" или "completed"' });
        }
        allowedFields.status = req.body.status;
      }

      if (Object.keys(allowedFields).length === 0) {
        return res.status(400).json({ message: 'Нет данных для обновления' });
      }

      await assignment.update(allowedFields);
      
      // Получаем обновленное задание
      const updatedAssignment = await db.Assignment.findByPk(id, {
        include: [
          { 
            model: db.TechCard, 
            as: 'techCard',
            attributes: ['id', 'productName', 'description']
          }
        ]
      });

      return res.json({ 
        message: 'Задание обновлено', 
        assignment: updatedAssignment 
      });
    }

    return res.status(403).json({ message: 'Доступ запрещён' });

  } catch (e) {
    console.error('Update assignment error:', e);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// ✅ ИСПРАВЛЕНИЕ: Удаление задания (мастер и админ)
exports.deleteAssignment = async (req, res) => {
  try {
    if (!hasManagePermission(req.user.role)) {
      return res.status(403).json({ message: 'Доступ запрещён' });
    }

    const { id } = req.params;
    
    // Проверяем существование задания
    const assignment = await db.Assignment.findByPk(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Задание не найдено' });
    }

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

// ✅ ИСПРАВЛЕНИЕ: Получить детальное задание по ID
exports.getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await db.Assignment.findByPk(id, {
      include: [
        { 
          model: db.User, 
          as: 'operator', 
          attributes: ['id', 'firstName', 'lastName', 'username'] 
        },
        { 
          model: db.TechCard, 
          as: 'techCard',
          attributes: ['id', 'productName', 'description']
        }
      ]
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Задание не найдено' });
    }

    const user = req.user;

    // ✅ ИСПРАВЛЕНИЕ: Упрощенная проверка прав доступа
    if (hasManagePermission(user.role) || 
        (assignment.operatorId === user.userId && user.role === 'employee')) {
      return res.json(assignment);
    }

    return res.status(403).json({ message: 'Доступ запрещён' });

  } catch (e) {
    console.error('Get assignment error:', e);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// ✅ НОВОЕ: Массовая загрузка заданий из Excel
exports.uploadAssignmentsFromExcel = async (req, res) => {
  try {
    // Проверка прав доступа
    if (!hasManagePermission(req.user.role)) {
      return res.status(403).json({ message: 'Доступ запрещён' });
    }

    // Проверка наличия файла
    if (!req.file) {
      return res.status(400).json({ message: 'Excel файл не загружен' });
    }

    console.log('📁 Загружен Excel файл:', req.file.filename);

    // Парсим Excel файл
    const parser = new AssignmentExcelParser();
    const results = await parser.parseExcelFile(req.file.path, req.user.userId);

    // Удаляем временный файл
    fs.unlinkSync(req.file.path);

    // Возвращаем результаты
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
    
    // Удаляем файл в случае ошибки
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ 
      message: 'Ошибка обработки Excel файла', 
      error: error.message 
    });
  }
};

// ✅ ИСПРАВЛЕНИЕ: Получить статистику по заданиям
exports.getAssignmentStatistics = async (req, res) => {
  try {
    if (!hasManagePermission(req.user.role)) {
      return res.status(403).json({ message: 'Доступ запрещён' });
    }

    const stats = await db.Assignment.findAll({
      attributes: [
        'status',
        [db.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: ['status']
    });

    const totalAssignments = await db.Assignment.count();
    
    // ✅ ИСПРАВЛЕНИЕ: Исправлена опечатка db.Sequelize.Op -> db.sequelize.Op
    const completedToday = await db.Assignment.count({
      where: {
        status: 'completed',
        updatedAt: {
          [db.sequelize.Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
        }
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

// В конец assignmentController.js добавьте для отладки:
console.log('🔍 Assignment Controller exports:', {
  getAssignments: typeof exports.getAssignments,
  createAssignment: typeof exports.createAssignment,
  updateAssignment: typeof exports.updateAssignment,
  deleteAssignment: typeof exports.deleteAssignment,  
  getAssignmentById: typeof exports.getAssignmentById,
  uploadAssignmentsFromExcel: typeof exports.uploadAssignmentsFromExcel,
  getAssignmentStatistics: typeof exports.getAssignmentStatistics,
  uploadExcelMiddleware: typeof exports.uploadExcelMiddleware
});


