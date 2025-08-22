const jwt = require('jsonwebtoken');
const { authMiddleware } = require('../../users/authMiddleware');
const db = require('../../models');

describe('Auth Middleware', () => {
  const mockUser = {
    id: 1,
    role: 'admin',
    departmentId: 1,
    firstName: 'Test',
    lastName: 'User'
  };

  beforeAll(() => {
    // Установить одинаковый JWT секрет
    process.env.JWT_SECRET = 'test-secret';
  });

  beforeEach(() => {
    // Мокаем User.findByPk
    jest.spyOn(db.User, 'findByPk').mockResolvedValue(mockUser);
    
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should authenticate valid token', async () => {
    // Подписываем токен тем же секретом
    const token = jwt.sign({ userId: 1 }, 'test-secret');
    req.headers.authorization = `Bearer ${token}`;

    await authMiddleware(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user.userId).toBe(1);
    expect(next).toHaveBeenCalled();
  });

  it('should reject missing token', async () => {
    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'Unauthorized'
    }));
  });

  it('should reject invalid token', async () => {
    req.headers.authorization = 'Bearer invalid-token';

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
