const db = require('../models');

// Получить список сменных заданий по роли
exports.getAssignments = async (req, res) => {
  try {
    const user = req.user;

    let assignments;
    if (user.role === 'master') {
      // Мастер видит все задания
      assignments = await db.Assignment.findAll({
        include: [{ model: db.User, as: 'operator', attributes: ['id', 'firstName', 'lastName'] },
                  { model: db.TechCard, as: 'techCard' }]
      });
    } else if (user.role === 'employee' || user.role === 'operator') {
      // Сотрудник видит только свои задания
      assignments = await db.Assignment.findAll({
        where: { operatorId: user.userId },
        include: [{ model: db.TechCard, as: 'techCard' }]
      });
    } else {
      return res.status(403).json({ message: 'Доступ запрещён' });
    }

    res.json(assignments);
  } catch (e) {
    console.error('Get assignments error:', e);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Создание задания (только мастер)
exports.createAssignment = async (req, res) => {
  try {
    if (req.user.role !== 'master') {
      return res.status(403).json({ message: 'Доступ запрещён' });
    }

    const { operatorId, shiftDate, shiftType, taskDescription, machineNumber, detailName, customerName, plannedQuantity, techCardId } = req.body;

    const assignment = await db.Assignment.create({
      operatorId, shiftDate, shiftType, taskDescription, machineNumber, detailName, customerName, plannedQuantity, techCardId, status: 'assigned'
    });

    res.status(201).json(assignment);

  } catch (e) {
    console.error('Create assignment error:', e);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Обновление задания.
// Для мастера – любые поля.
// Для сотрудника – только actualQuantity и пометка статуса "completed".
exports.updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await db.Assignment.findByPk(id);

    if (!assignment) {
      return res.status(404).json({ message: 'Задание не найдено' });
    }

    const user = req.user;

    if (user.role === 'master') {
      // Мастер может обновить все поля (например, через тело запроса)
      await assignment.update(req.body);
      return res.json({ message: 'Задание обновлено', assignment });
    } 

    if ((user.role === 'employee' || user.role === 'operator') && assignment.operatorId === user.userId) {
      // Сотрудник может обновить только фактическое количество и статус
      const allowedFields = {};
      if (req.body.actualQuantity !== undefined) allowedFields.actualQuantity = req.body.actualQuantity;
      if (req.body.status !== undefined) allowedFields.status = req.body.status; // например, "completed"

      await assignment.update(allowedFields);
      return res.json({ message: 'Задание обновлено', assignment });
    }

    return res.status(403).json({ message: 'Доступ запрещён' });

  } catch (e) {
    console.error('Update assignment error:', e);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Удаление задания (только мастер)
exports.deleteAssignment = async (req, res) => {
  try {
    if (req.user.role !== 'master') {
      return res.status(403).json({ message: 'Доступ запрещён' });
    }

    const { id } = req.params;
    const deleted = await db.Assignment.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ message: 'Задание не найдено' });
    }

    res.json({ message: 'Задание удалено' });

  } catch (e) {
    console.error('Delete assignment error:', e);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получить детальное задание по ID (доступно оператору только к своему заданию)
exports.getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await db.Assignment.findByPk(id, {
      include: [{ model: db.User, as: 'operator', attributes: ['id', 'firstName', 'lastName'] },
                { model: db.TechCard, as: 'techCard' }]
    });

    if (!assignment) return res.status(404).json({ message: 'Задание не найдено' });

    const user = req.user;

    if (user.role === 'master' || (assignment.operatorId === user.userId && (user.role === 'employee' || user.role === 'operator'))) {
      return res.json(assignment);
    }

    return res.status(403).json({ message: 'Доступ запрещён' });

  } catch (e) {
    console.error('Get assignment error:', e);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};
