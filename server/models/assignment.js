// server/models/assignment.js
module.exports = (sequelize, DataTypes) => {
  const Assignment = sequelize.define('Assignment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    operatorId: { type: DataTypes.INTEGER, allowNull: false },
    shiftDate: { type: DataTypes.DATEONLY, allowNull: false },
    taskDescription: { type: DataTypes.TEXT, allowNull: false },
    machineNumber: { type: DataTypes.STRING, allowNull: false },
    detailName: { type: DataTypes.STRING, allowNull: false },
    customerName: { type: DataTypes.STRING, allowNull: false },
    plannedQuantity: { type: DataTypes.INTEGER, allowNull: false },
    actualQuantity: { type: DataTypes.INTEGER, allowNull: true },
    techCardId: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    tableName: 'assignments',
  });

  Assignment.associate = models => {
    Assignment.belongsTo(models.User, { foreignKey: 'operatorId', as: 'operator' });
    Assignment.belongsTo(models.TechCard, { foreignKey: 'techCardId', as: 'techCard' });
  };

  return Assignment;
};
