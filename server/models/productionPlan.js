// server/models/productionPlan.js
module.exports = (sequelize, DataTypes) => {
  const ProductionPlan = sequelize.define('ProductionPlan', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    customerName: { type: DataTypes.STRING, allowNull: false },
    orderName: { type: DataTypes.STRING, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false }, // Общее количество заказа
    completedQuantity: { type: DataTypes.INTEGER, defaultValue: 0 }, // Сколько уже выполнено
    progressPercent: { type: DataTypes.FLOAT, defaultValue: 0 }, // Автоматически вычисляется
    deadline: { type: DataTypes.DATE, allowNull: false },
    status: { 
      type: DataTypes.ENUM('planned', 'in_progress', 'completed', 'cancelled'), 
      defaultValue: 'planned' 
    },
    techCardId: { type: DataTypes.INTEGER, allowNull: true }, // Привязка к техкарте
    priority: { type: DataTypes.INTEGER, defaultValue: 1 }, // Приоритет выполнения
    notes: { type: DataTypes.TEXT, allowNull: true }
  }, {
    tableName: 'production_plans',
    hooks: {
      // Автоматически пересчитываем прогресс при изменении
      beforeSave: (plan) => {
        if (plan.quantity > 0) {
          plan.progressPercent = Math.round((plan.completedQuantity / plan.quantity) * 100);
          
          // Обновляем статус на основе прогресса
          if (plan.progressPercent === 0) {
            plan.status = 'planned';
          } else if (plan.progressPercent < 100) {
            plan.status = 'in_progress';
          } else if (plan.progressPercent >= 100) {
            plan.status = 'completed';
          }
        }
      }
    }
  });

  ProductionPlan.associate = models => {
    ProductionPlan.hasMany(models.Assignment, { foreignKey: 'productionPlanId', as: 'assignments' });
    ProductionPlan.belongsTo(models.TechCard, { foreignKey: 'techCardId', as: 'techCard' });
  };

  return ProductionPlan;
};

