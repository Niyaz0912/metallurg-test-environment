// server/models/productionPlan.js
module.exports = (sequelize, DataTypes) => {
  const ProductionPlan = sequelize.define('ProductionPlan', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    customerName: { type: DataTypes.STRING, allowNull: false },
    orderName: { type: DataTypes.STRING, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    deadline: { type: DataTypes.DATE, allowNull: false },
    progressPercent: { type: DataTypes.FLOAT, defaultValue: 0 }, // от 0 до 100
  }, {
    tableName: 'production_plans',
  });

  return ProductionPlan;
};
