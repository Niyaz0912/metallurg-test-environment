const db = require('../models');

// Проверка прав доступа (только администратор)
const hasManagePermission = (userRole) => userRole === 'admin';
const hasViewPermission = (userRole) => ['master', 'admin', 'employee', 'director'].includes(userRole);

// Получить все отделы
const getAllDepartments = async (req, res) => {
  try {
    if (!hasViewPermission(req.user.role)) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }

    const departments = await db.Department.findAll({
      include: [
        {
          model: db.User,
          as: 'users',
          attributes: ['id', 'firstName', 'lastName'],
          required: false
        }
      ]
    });
    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Ошибка при получении отделов' });
  }
};

// Получить отдел по ID
const getDepartment = async (req, res) => {
  try {
    if (!hasViewPermission(req.user.role)) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }

    const { id } = req.params;
    const department = await db.Department.findByPk(id, {
      include: [
        {
          model: db.User,
          as: 'users',
          attributes: ['id', 'firstName', 'lastName', 'role', 'position'],
          required: false
        }
      ]
    });

    if (!department) {
      return res.status(404).json({ error: 'Отдел не найден' });
    }

    res.json(department);
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({ error: 'Ошибка при получении отдела' });
  }
};

// Создать новый отдел
const createDepartment = async (req, res) => {
  try {
    if (!hasManagePermission(req.user.role)) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }

    const { name, description } = req.body;

    // Валидация
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Название отдела обязательно' });
    }

    if (name.length > 255) {
      return res.status(400).json({ error: 'Название отдела слишком длинное (максимум 255 символов)' });
    }

    // Проверка уникальности названия
    const existingDepartment = await db.Department.findOne({ 
      where: { name: name.trim() } 
    });

    if (existingDepartment) {
      return res.status(400).json({ error: 'Отдел с таким названием уже существует' });
    }

    const department = await db.Department.create({
      name: name.trim(),
      description: description ? description.trim() : null
    });

    res.status(201).json(department);
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ error: 'Ошибка при создании отдела' });
  }
};

// Обновить отдел
const updateDepartment = async (req, res) => {
  try {
    if (!hasManagePermission(req.user.role)) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }

    const { id } = req.params;
    const { name, description } = req.body;

    const department = await db.Department.findByPk(id);
    if (!department) {
      return res.status(404).json({ error: 'Отдел не найден' });
    }

    // Валидация названия при обновлении
    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'Название отдела не может быть пустым' });
      }

      if (name.length > 255) {
        return res.status(400).json({ error: 'Название отдела слишком длинное (максимум 255 символов)' });
      }

      // Проверка уникальности (исключая текущий отдел)
      if (name.trim() !== department.name) {
        const existingDepartment = await db.Department.findOne({
          where: { name: name.trim() }
        });

        if (existingDepartment) {
          return res.status(400).json({ error: 'Отдел с таким названием уже существует' });
        }
      }
    }

    // Обновление только переданных полей
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;

    await department.update(updateData);
    res.json(department);
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении отдела' });
  }
};

// Удалить отдел
const deleteDepartment = async (req, res) => {
  try {
    if (!hasManagePermission(req.user.role)) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }

    const { id } = req.params;
    const department = await db.Department.findByPk(id);

    if (!department) {
      return res.status(404).json({ error: 'Отдел не найден' });
    }

    // Проверка связанных пользователей
    const usersInDepartment = await db.User.count({
      where: { departmentId: id }
    });

    if (usersInDepartment > 0) {
      return res.status(400).json({
        error: `Нельзя удалить отдел. В нем работает ${usersInDepartment} сотрудников. Сначала переведите их в другие отделы.`
      });
    }

    await department.destroy();
    res.json({ message: 'Отдел успешно удален' });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ error: 'Ошибка при удалении отдела' });
  }
};

module.exports = {
  getAllDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment
};

