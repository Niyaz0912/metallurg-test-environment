// server/models/techCardExecution.js
module.exports = (sequelize, DataTypes) => {
  const TechCardExecution = sequelize.define('TechCardExecution', {
    techCardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tech_cards',
        key: 'id'
      }
    },
    executedById: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'ID исполнителя работ'
    },
    quantityProduced: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Количество произведенных деталей за смену'
    },
    setupNumber: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Номер установки/станка'
    },
    executedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Время выполнения работ'
    }
  }, {
    tableName: 'tech_card_executions',
    timestamps: true
  });

  TechCardExecution.associate = function(models) {
    TechCardExecution.belongsTo(models.TechCard, {
      foreignKey: 'techCardId',
      as: 'techCard'
    });
    
    TechCardExecution.belongsTo(models.User, {
      foreignKey: 'executedById',
      as: 'executor'
    });
  };

  return TechCardExecution;
};

