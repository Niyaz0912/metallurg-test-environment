// server/models/techCard.js
module.exports = (sequelize, DataTypes) => {
  const TechCard = sequelize.define('TechCard', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    productName: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    drawingUrl: { type: DataTypes.STRING }, // путь или URL к чертежу
    specifications: { type: DataTypes.JSONB, allowNull: true }, // размеры, характеристики
    productionStages: { 
      type: DataTypes.JSONB, 
      allowNull: false,
      // пример: [{ stageName: 'Сварка', order: 1, responsible: 'Оператор'}, ...]
    },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'tech_cards',
  });

  TechCard.associate = models => {
    TechCard.hasMany(models.TechCardExecution, { foreignKey: 'techCardId', as: 'executions' });
  };

  return TechCard;
};
