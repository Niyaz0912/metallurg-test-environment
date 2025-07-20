'use strict';

module.exports = (sequelize, DataTypes) => {
  const Department = sequelize.define('Department', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'departments',
    timestamps: false,
    underscored: true
  });

  Department.associate = (models) => {
    Department.hasMany(models.User, {
      foreignKey: 'departmentId',
      as: 'users'
    });
  };

  return Department;
};
