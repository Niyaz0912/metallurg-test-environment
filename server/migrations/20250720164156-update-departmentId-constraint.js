module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Удаляем существующий foreign key (если есть)
    await queryInterface.removeConstraint('Users', 'Users_departmentId_foreign_idx');
    
    // 2. Изменяем колонку, устанавливая allowNull: false
    await queryInterface.changeColumn('Users', 'departmentId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Departments',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
  },

  async down(queryInterface, Sequelize) {
    // Возвращаем allowNull: true для возможности отката
    await queryInterface.changeColumn('Users', 'departmentId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Departments',
        key: 'id'
      }
    });
  }
};
