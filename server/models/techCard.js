// server/models/techCard.js - ИСПРАВЛЕННАЯ ВЕРСИЯ
module.exports = (sequelize, DataTypes) => {
  const TechCard = sequelize.define('TechCard', {
    // Основная информация (упрощенно)
    customer: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Заказчик (ПАО Северсталь)'
    },
    order: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Номер заказа'
    },
    productName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Название детали'
    },
    partNumber: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: 'unique_part_number',
      comment: 'Артикул детали'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Общее количество в заказе'
    },

    // PDF файл (главное!)
    pdfUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Ссылка на PDF с техкартой и чертежом'
    },
    pdfFileSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Размер PDF файла в байтах'
    },

    // Прогресс и статус
    totalProducedQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: 'Сколько уже произведено'
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'archived'),
      defaultValue: 'draft',
      allowNull: false,
      comment: 'Статус техкарты'
    },

    // Планирование и приоритизация (НОВЫЕ ПОЛЯ)
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium',
      allowNull: false,
      comment: 'Приоритет выполнения техкарты'
    },
    plannedEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Плановая дата завершения производства'
    },
    actualEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Фактическая дата завершения'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Дополнительные заметки по техкарте'
    },

    // Метаданные
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'ID пользователя, создавшего техкарту'
    }
  }, {
    tableName: 'tech_cards',
    timestamps: true,
    // ✅ ИСПРАВЛЕНО: Убрал дублирующиеся индексы
    indexes: [
      // ❌ Убран: { fields: ['customer'] } - уже создан миграцией
      {
        fields: ['status']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['plannedEndDate']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  TechCard.associate = function (models) {
    // Связь с пользователем-создателем
    TechCard.belongsTo(models.User, {
      foreignKey: 'createdById',
      as: 'creator'
    });

    // Связь с доступами к техкарте
    TechCard.hasMany(models.TechCardAccess, {
      foreignKey: 'techCardId',
      as: 'accesses'
    });

    // Связь с выполнениями работ по техкарте
    TechCard.hasMany(models.TechCardExecution, {
      foreignKey: 'techCardId',
      as: 'executions'
    });
  };

  return TechCard;
};

