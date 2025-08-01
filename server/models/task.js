// server/models/task.js
module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    status: { 
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'), 
      defaultValue: 'pending' 
    },
    priority: { type: DataTypes.ENUM('low', 'medium', 'high'), defaultValue: 'medium' },
    assignedDepartmentId: { type: DataTypes.INTEGER, allowNull: false },
    assignedUserId: { type: DataTypes.INTEGER, allowNull: true }, // можно назначить конкретного исполнителя
    dueDate: { type: DataTypes.DATE, allowNull: true },
    createdById: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    tableName: 'tasks',
  });

  Task.associate = models => {
    Task.belongsTo(models.Department, { foreignKey: 'assignedDepartmentId', as: 'assignedDepartment' });
    Task.belongsTo(models.User, { foreignKey: 'assignedUserId', as: 'assignedUser' });
    Task.belongsTo(models.User, { foreignKey: 'createdById', as: 'creator' });
  };

  return Task;
};
