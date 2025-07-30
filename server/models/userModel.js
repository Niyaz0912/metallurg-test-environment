'use strict';

const UserRoles = {
  EMPLOYEE: 'employee',
  MASTER: 'master',
  DIRECTOR: 'director',
  ADMIN: 'admin'
};

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 150],
        is: /^[a-zA-Z0-9@._+-]+$/i
      }
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRoles)),
      allowNull: false,
      defaultValue: UserRoles.EMPLOYEE
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: {
          args: /^$|^(\+7)[0-9]{10}$/,
          msg: 'Телефон должен быть пустым или в формате +7XXXXXXXXXX'
        }
      }
    },
    masterId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'departments',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    position: {           // <--- Новое поле для должности
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'users',
    indexes: [],
    defaultScope: {
      attributes: { exclude: ['passwordHash'] }
    },
    scopes: {
      withPassword: {
        attributes: {}
      }
    }
  });

  User.associate = (models) => {
    User.belongsTo(models.Department, {
      foreignKey: 'departmentId',
      as: 'department'
    });
    User.hasMany(User, { 
      as: 'operators', 
      foreignKey: 'masterId' 
    });
    User.belongsTo(User, { 
      as: 'master', 
      foreignKey: 'masterId' 
    });
  };

  User.UserRoles = UserRoles;
  return User;
};

