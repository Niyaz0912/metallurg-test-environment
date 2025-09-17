// server/models/assignment.js
module.exports = (sequelize, DataTypes) => {
  const Assignment = sequelize.define('Assignment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    
    // Связи
    operatorId: { type: DataTypes.INTEGER, allowNull: false },
    productionPlanId: { type: DataTypes.INTEGER, allowNull: false },
    techCardId: { type: DataTypes.INTEGER, allowNull: false },
    
    // Основные данные
    shiftDate: { type: DataTypes.DATEONLY, allowNull: false },
    shiftType: { 
      type: DataTypes.ENUM('day', 'night'), 
      allowNull: false 
    },
    taskDescription: { type: DataTypes.TEXT, allowNull: false },
    machineNumber: { type: DataTypes.STRING, allowNull: false },
    
    // ✅ ИСПРАВЛЕНИЕ: Сделать необязательными с дефолтами
    detailName: { 
      type: DataTypes.STRING, 
      allowNull: true,           // ✅ ИЗМЕНИТЬ НА true
      defaultValue: 'Не указано'  // ✅ ДОБАВИТЬ дефолт
    },
    customerName: { 
      type: DataTypes.STRING, 
      allowNull: true,           // ✅ ИЗМЕНИТЬ НА true  
      defaultValue: 'Не указан'   // ✅ ДОБАВИТЬ дефолт
    },
    
    // Количество
    plannedQuantity: { type: DataTypes.INTEGER, allowNull: false },
    actualQuantity: { type: DataTypes.INTEGER, allowNull: true },
    
    // Статус и контроль
    status: { 
      type: DataTypes.ENUM('assigned', 'in_progress', 'completed', 'quality_check'), 
      allowNull: false, 
      defaultValue: 'assigned' 
    },
    startedAt: { type: DataTypes.DATE, allowNull: true },
    completedAt: { type: DataTypes.DATE, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true }
  }, {
    tableName: 'assignments',
    indexes: [
      { fields: ['operatorId'] },
      { fields: ['productionPlanId'] },
      { fields: ['shiftDate'] },
      { fields: ['status'] }
    ]
  });

  Assignment.associate = models => {
    Assignment.belongsTo(models.User, { foreignKey: 'operatorId', as: 'operator' });
    Assignment.belongsTo(models.ProductionPlan, { foreignKey: 'productionPlanId', as: 'productionPlan' });
    Assignment.belongsTo(models.TechCard, { foreignKey: 'techCardId', as: 'techCard' });
  };

  return Assignment;
};



