const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database'); // путь к вашей конфигурации Sequelize

// Определяем роли
const UserRoles = {
  EMPLOYEE: 'employee',
  MASTER: 'master',
  DIRECTOR: 'director',
  ADMIN: 'admin'
};

class User extends Model {}

User.init({
  username: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: {
      len: [1, 150],
      is: /^[a-zA-Z0-9@._+-]+$/i
    },
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM(...Object.values(UserRoles)),
    allowNull: false,
    defaultValue: UserRoles.EMPLOYEE,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
        is: /^(\+7)[0-9]{10}$/ // Только +7, затем ровно 10 цифр
    }
  },
  masterId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // <--- добавляем DEPARTMENT ID
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: false, // если всегда должен быть отдел. Можно поставить true, если не обязательно.
    references: {
      model: 'departments', // название таблицы в БД
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'Users',
  indexes: [{ unique: true, fields: ['username'] }],
  defaultScope: {
    attributes: { exclude: ['passwordHash'] },
  },
  scopes: {
    withPassword: {
      attributes: {},
    }
  }
});

// Создаем связь мастер - операторы (сотрудники)
User.hasMany(User, { as: 'operators', foreignKey: 'masterId' });
User.belongsTo(User, { as: 'master', foreignKey: 'masterId' });
// Связь с департаментом (belongsTo)
User.associate = (models) => {
  User.belongsTo(models.Department, { foreignKey: 'departmentId', as: 'department' });
};

module.exports = {
  User,
  UserRoles
};
