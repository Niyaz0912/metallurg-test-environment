require('dotenv').config();

// Устанавливаем переменные окружения для тестов
process.env.NODE_ENV = 'test';
process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:';
process.env.JWT_SECRET = 'test_jwt_secret';

const { Sequelize, DataTypes } = require('sequelize');

// Создаем подключение к SQLite в памяти
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: console.log // Показывать SQL запросы
});

// Импортируем модель User из правильного файла
const UserModel = require('./models/userModel');  // ← Исправлено!
const User = UserModel(sequelize, DataTypes);

// Создаем простую модель Department (нужна для связей)
const Department = sequelize.define('Department', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'departments'
});

// Устанавливаем связи
User.belongsTo(Department, {
  foreignKey: 'departmentId',
  as: 'department'
});

async function testDatabase() {
  try {
    console.log('🔌 Подключаемся к базе данных...');
    await sequelize.authenticate();
    console.log('✅ Подключение успешно!');

    console.log('📋 Синхронизируем таблицы...');
    await sequelize.sync({ force: true });
    console.log('✅ Таблицы созданы!');

    // Создаем департамент (обязательно для User)
    console.log('🏢 Создаем тестовый департамент...');
    const department = await Department.create({
      name: 'IT Department'
    });
    console.log('✅ Департамент создан:', department.toJSON());

    // Создаем пользователя
    console.log('👤 Создаем пользователя...');
    const userData = {
      username: 'testuser',
      firstName: 'Тест',
      lastName: 'Пользователь',
      role: 'employee',
      phone: '+79991234567',
      passwordHash: 'hashed_password_123',
      departmentId: department.id,
      position: 'Разработчик'
    };

    const user = await User.create(userData);
    console.log('✅ Пользователь создан:');
    console.log(JSON.stringify(user.toJSON(), null, 2));

    // Находим пользователя
    console.log('🔍 Ищем пользователя...');
    const foundUser = await User.findByPk(user.id);
    console.log('✅ Пользователь найден:', foundUser.toJSON());

    // Обновляем пользователя
    console.log('📝 Обновляем пользователя...');
    await foundUser.update({ phone: '+79997654321' });
    console.log('✅ Пользователь обновлен:', foundUser.toJSON());

    // Удаляем пользователя
    console.log('🗑️ Удаляем пользователя...');
    await foundUser.destroy();
    console.log('✅ Пользователь удален!');

    // Проверяем что пользователь удален
    const deletedUser = await User.findByPk(user.id);
    console.log('🔍 Проверяем удаление:', deletedUser); // Должно быть null

    console.log('🎉 Все операции с базой данных прошли успешно!');

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    console.error('📍 Подробности:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Соединение с БД закрыто');
  }
}

// Запускаем тестирование
testDatabase();
