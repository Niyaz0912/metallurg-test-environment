module.exports = (sequelize, DataTypes) => {
  const Department = sequelize.define('Department', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'departments',
    timestamps: false
  });

  Department.associate = (models) => {
    // Здесь можно будет прописать Department.hasMany(models.User, { ... });
  };

  return Department;
};
