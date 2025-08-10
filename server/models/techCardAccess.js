// server/models/techCardAccess.js
module.exports = (sequelize, DataTypes) => {
  const TechCardAccess = sequelize.define('TechCardAccess', {
    techCardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tech_cards',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    accessType: {
      type: DataTypes.ENUM('view', 'download', 'edit'),
      allowNull: false,
      comment: 'Тип доступа к техкарте'
    },
    accessedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Время доступа'
    }
  }, {
    tableName: 'tech_card_accesses',
    timestamps: true
  });

  TechCardAccess.associate = function(models) {
    TechCardAccess.belongsTo(models.TechCard, {
      foreignKey: 'techCardId',
      as: 'techCard'
    });
    
    TechCardAccess.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return TechCardAccess;
};

