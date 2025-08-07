// server/models/techCard.js
module.exports = (sequelize, DataTypes) => {
  const TechCard = sequelize.define('TechCard', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    
    // Основная информация
    productName: { type: DataTypes.STRING, allowNull: false },
    partNumber: { type: DataTypes.STRING, unique: true }, // Артикул
    description: { type: DataTypes.TEXT, allowNull: true },
    
    // Документация
    drawingUrl: { type: DataTypes.STRING, allowNull: true }, // Ссылка на чертеж
    specifications: { type: DataTypes.JSON, allowNull: true }, // Технические характеристики
    
    // Этапы производства
    productionStages: { 
      type: DataTypes.JSON, 
      allowNull: true,
      comment: 'Массив этапов: [{ name, description, tools, duration, qualityCheckpoints }]'
    },
    
    // Статистика использования
    totalUsageCount: { type: DataTypes.INTEGER, defaultValue: 0 }, // Сколько раз использовалась
    totalProducedQuantity: { type: DataTypes.INTEGER, defaultValue: 0 }, // Общее кол-во произведенных деталей
    
    // Управление версиями
    version: { type: DataTypes.STRING, defaultValue: '1.0' },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'archived'),
      defaultValue: 'draft'
    },
    
    // Временные нормы
    estimatedTimePerUnit: { type: DataTypes.INTEGER, allowNull: true }, // Время на 1 деталь (минуты)
    
    // Дополнительно
    notes: { type: DataTypes.TEXT, allowNull: true },
    createdById: { type: DataTypes.INTEGER, allowNull: true } // Кто создал
  }, {
    tableName: 'tech_cards',
    indexes: [
      { fields: ['partNumber'] },
      { fields: ['productName'] },
      { fields: ['status'] }
    ],
    hooks: {
      // При создании нового Assignment с этой техкартой - увеличиваем счетчик
      afterFind: async (techCards, options) => {
        // Можно добавить логику автоматического обновления статистики
      }
    }
  });

  TechCard.associate = models => {
    TechCard.hasMany(models.Assignment, { foreignKey: 'techCardId', as: 'assignments' });
    TechCard.hasMany(models.ProductionPlan, { foreignKey: 'techCardId', as: 'productionPlans' });
    TechCard.hasMany(models.TechCardExecution, { foreignKey: 'techCardId', as: 'executions' });
    TechCard.belongsTo(models.User, { foreignKey: 'createdById', as: 'creator' });
  };

  return TechCard;
};

