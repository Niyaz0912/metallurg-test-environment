const request = require('supertest');
const app = require('../../server');
const { User, Department, sequelize } = require('../../models');

describe('Auth Controller', () => {
  let testDepartment;

  beforeAll(async () => {
    // Синхронизируем базу данных для тестов
    await sequelize.sync({ force: true });
    
    // Создаем тестовый отдел для связи
    testDepartment = await Department.create({
      name: 'Тестовый отдел для авторизации'
    });
  });

  beforeEach(async () => {
    // Очищаем пользователей перед каждым тестом
    await User.destroy({ where: {}, force: true });
  });

  afterAll(async () => {
    // Закрываем соединение с базой данных
    await sequelize.close();
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      // Создаем тестового пользователя перед каждым тестом логина
      await User.create({
        username: 'testuser',
        firstName: 'Тест',
        lastName: 'Пользователь',
        passwordHash: 'password123', // В тестовой среде пароль хранится как есть
        role: 'employee',
        departmentId: testDepartment.id
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.username).toBe('testuser');
      expect(response.body.user.firstName).toBe('Тест');
      expect(response.body.user.lastName).toBe('Пользователь');
      expect(response.body.user.role).toBe('employee');
      // passwordHash НЕ должен возвращаться в ответе
      expect(response.body.user.passwordHash).toBeUndefined();
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Неверный логин или пароль');
    });

    it('should reject missing password field', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          username: 'testuser'
          // password отсутствует
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Неверный логин или пароль');
    });

    it('should reject missing username field', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          password: 'password123'
          // username отсутствует
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Неверный логин или пароль');
    });

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          username: 'nonexistent',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Неверный логин или пароль');
    });

    it('should include department information in response', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.user.department).toBeDefined();
      expect(response.body.user.department.name).toBe('Тестовый отдел для авторизации');
    });
  });
});

