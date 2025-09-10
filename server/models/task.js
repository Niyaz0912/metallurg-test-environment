// server/models/task.js
module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    title: { 
      type: DataTypes.STRING, 
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Заголовок задания не может быть пустым' },
        len: { args: [1, 255], msg: 'Заголовок должен быть от 1 до 255 символов' }
      }
    },
    description: { 
      type: DataTypes.TEXT,
      allowNull: true 
    },
    status: { 
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'), 
      defaultValue: 'pending',
      allowNull: false
    },
    priority: { 
      type: DataTypes.ENUM('low', 'medium', 'high'), 
      defaultValue: 'medium',
      allowNull: false
    },
    assignedDepartmentId: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: {
        model: 'departments',
        key: 'id'
      }
    },
    assignedUserId: { 
      type: DataTypes.INTEGER, 
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    dueDate: { 
      type: DataTypes.DATE, 
      allowNull: true 
    },
    createdById: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }  
    }
  }, {
    tableName: 'tasks',
    timestamps: true, // ✅ ДОБАВЛЕНО: createdAt, updatedAt
    indexes: [ // ✅ ДОБАВЛЕНО: индексы для производительности
      { fields: ['assignedDepartmentId'] },
      { fields: ['assignedUserId'] },
      { fields: ['createdById'] },
      { fields: ['status'] },
      { fields: ['dueDate'] }
    ]
  });

  Task.associate = models => {
    Task.belongsTo(models.Department, { 
      foreignKey: 'assignedDepartmentId', 
      as: 'assignedDepartment',
      onDelete: 'RESTRICT' // ✅ ДОБАВЛЕНО: защита от удаления
    });
    Task.belongsTo(models.User, { 
      foreignKey: 'assignedUserId', 
      as: 'assignedUser',
      onDelete: 'SET NULL' // ✅ ДОБАВЛЕНО: при удалении пользователя обнулить
    });
    Task.belongsTo(models.User, { 
      foreignKey: 'createdById', 
      as: 'creator',
      onDelete: 'RESTRICT' // ✅ ДОБАВЛЕНО: защита от удаления создателя
    });
  };

  return Task;
};

