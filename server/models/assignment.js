module.exports = (sequelize, DataTypes) => {
  const Assignment = sequelize.define('Assignment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    operatorId: { type: DataTypes.INTEGER, allowNull: false },

    shiftDate: { type: DataTypes.DATEONLY, allowNull: false },

    shiftType: { 
      type: DataTypes.ENUM('day', 'night'), 
      allowNull: false 
    },

    taskDescription: { type: DataTypes.TEXT, allowNull: false },

    machineNumber: { type: DataTypes.STRING, allowNull: false },

    detailName: { type: DataTypes.STRING, allowNull: false },

    customerName: { type: DataTypes.STRING, allowNull: false },

    plannedQuantity: { type: DataTypes.INTEGER, allowNull: false },

    actualQuantity: { type: DataTypes.INTEGER, allowNull: true },

    techCardId: { type: DataTypes.INTEGER, allowNull: false },

    status: { 
      type: DataTypes.ENUM('assigned', 'completed'), 
      allowNull: false, 
      defaultValue: 'assigned' 
    }
  }, {
    tableName: 'assignments',

    indexes: [
      { fields: ['operatorId'] },
      { fields: ['shiftDate'] }
    ]
  });

  Assignment.associate = models => {
    Assignment.belongsTo(models.User, { foreignKey: 'operatorId', as: 'operator' });
    Assignment.belongsTo(models.TechCard, { foreignKey: 'techCardId', as: 'techCard' });
  };

  return Assignment;
};

