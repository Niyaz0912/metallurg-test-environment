// server/models/techCardExecution.js
module.exports = (sequelize, DataTypes) => {
  const TechCardExecution = sequelize.define('TechCardExecution', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    techCardId: { type: DataTypes.INTEGER, allowNull: false },
    executedById: { type: DataTypes.INTEGER, allowNull: false },
    stageName: { type: DataTypes.STRING, allowNull: false },
    quantityProduced: { type: DataTypes.INTEGER, allowNull: false },
    executedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    qualityStatus: { 
      type: DataTypes.ENUM('OK', 'NOK'), 
      allowNull: true 
    },
    qualityComment: { type: DataTypes.TEXT, allowNull: true },
    checkedById: { type: DataTypes.INTEGER, allowNull: true },
  }, {
    tableName: 'tech_card_executions',
  });

  TechCardExecution.associate = models => {
    TechCardExecution.belongsTo(models.TechCard, { foreignKey: 'techCardId' });
    TechCardExecution.belongsTo(models.User, { foreignKey: 'executedById', as: 'executor' });
    TechCardExecution.belongsTo(models.User, { foreignKey: 'checkedById', as: 'qualityInspector' });
  };

  return TechCardExecution;
};
