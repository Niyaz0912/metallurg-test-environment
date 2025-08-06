// server/models/techCard.js
module.exports = (sequelize, DataTypes) => {
  const TechCard = sequelize.define('TechCard', {
    productName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    specifications: { 
      type: DataTypes.JSON, 
      allowNull: true 
    },
    operationSteps: {
      type: DataTypes.JSON,  
      allowNull: true
    }
  }, {
    tableName: 'tech_cards'
  });

  // Ассоциации если есть
  TechCard.associate = (models) => {
    // связи с другими моделями
  };

  return TechCard;
};
