// server/models/assignment.js
module.exports = (sequelize, DataTypes) => {
  const Assignment = sequelize.define('Assignment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    
    // Связи
    operatorId: { type: DataTypes.INTEGER, allowNull: false },
    productionPlanId: { type: DataTypes.INTEGER, allowNull: false }, // ✅ НОВОЕ: Связь с планом
    techCardId: { type: DataTypes.INTEGER, allowNull: false },
    
    // Основные данные
    shiftDate: { type: DataTypes.DATEONLY, allowNull: false },
    shiftType: { 
      type: DataTypes.ENUM('day', 'night'), 
      allowNull: false 
    },
    taskDescription: { type: DataTypes.TEXT, allowNull: false },
    machineNumber: { type: DataTypes.STRING, allowNull: false },
    
    // ✅ УБРАНО: detailName, customerName (берутся из ProductionPlan)
    
    // Количество
    plannedQuantity: { type: DataTypes.INTEGER, allowNull: false }, // План на смену
    actualQuantity: { type: DataTypes.INTEGER, allowNull: true }, // Фактически выполнено
    
    // Статус и контроль
    status: { 
      type: DataTypes.ENUM('assigned', 'in_progress', 'completed', 'quality_check'), 
      allowNull: false, 
      defaultValue: 'assigned' 
    },
    startedAt: { type: DataTypes.DATE, allowNull: true }, // Время начала работы
    completedAt: { type: DataTypes.DATE, allowNull: true }, // Время завершения
    notes: { type: DataTypes.TEXT, allowNull: true }
  }, {
    tableName: 'assignments',
    indexes: [
      { fields: ['operatorId'] },
      { fields: ['productionPlanId'] },
      { fields: ['shiftDate'] },
      { fields: ['status'] }
    ],
    hooks: {
      // При обновлении actualQuantity - обновляем прогресс в ProductionPlan
      afterUpdate: async (assignment, options) => {
        if (assignment.changed('actualQuantity') && assignment.actualQuantity > 0) {
          const ProductionPlan = sequelize.models.ProductionPlan;
          
          // Получаем общий прогресс по плану
          const totalCompleted = await Assignment.sum('actualQuantity', {
            where: { 
              productionPlanId: assignment.productionPlanId,
              actualQuantity: { [sequelize.Op.not]: null }
            }
          });
          
          // Обновляем прогресс в производственном плане
          await ProductionPlan.update(
            { completedQuantity: totalCompleted || 0 },
            { where: { id: assignment.productionPlanId } }
          );
        }
      }
    }
  });

  Assignment.associate = models => {
    Assignment.belongsTo(models.User, { foreignKey: 'operatorId', as: 'operator' });
    Assignment.belongsTo(models.ProductionPlan, { foreignKey: 'productionPlanId', as: 'productionPlan' });
    Assignment.belongsTo(models.TechCard, { foreignKey: 'techCardId', as: 'techCard' });
  };

  return Assignment;
};


