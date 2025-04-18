jest.mock('sqlite3', () => {
  const mockDbInstance = {
    get: jest.fn(),
    run: jest.fn(),
    close: jest.fn(),
  };

  const mockDatabase = jest.fn((_, callback) => {
    if (callback) callback(null); // Simulate successful database initialization
    return mockDbInstance;
  });

  return {
    Database: mockDatabase,
    __mockInstance: mockDbInstance,
  };
});

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('./LoginHistoryDAO', () => {
  return jest.fn().mockImplementation(() => ({
    logLogin: jest.fn(),
  }));
});

const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const LoginHistoryDAO = require('./LoginHistoryDAO');
const AuthDAO = require('./AuthDAO');

describe('AuthDAO', () => {
  let dao;
  let dbMock;
  let loginHistoryMock;

  beforeEach(() => {
    dbMock = sqlite3.__mockInstance;
    loginHistoryMock = new LoginHistoryDAO();
    dao = new AuthDAO(':memory:');
    dao.db = dbMock; // Replace the database instance with the mock
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('constructor should initialize the database', () => {
    const dao = new AuthDAO(':memory:');
    expect(dao.db).toBeDefined();
  });

  test('register should reject if user already exists', async () => {
    const email = 'test@example.com';
    const password = 'password123';

    dbMock.get.mockImplementation((sql, params, cb) => cb(null, { email })); // User found

    await expect(dao.register(email, password)).rejects.toThrow('User with email already registered');
    expect(dbMock.get).toHaveBeenCalledWith(
      'SELECT * FROM Users WHERE email = ?',
      [email],
      expect.any(Function)
    );
  });

  test('register should throw an error if the query fails', async () => {
    const email = 'test@example.com';
    const password = 'password123';

    dbMock.get.mockImplementation((sql, params, callback) => {
      callback(new Error('Database error'), null); // Simulate query failure
    });

    await expect(dao.register(email, password)).rejects.toThrow('Database error');
  });

  test('register should create a new user', async () => {
    const email = 'test@example.com';
    const password = 'password123';
    const hashedPassword = 'hashedPassword123';

    bcrypt.hash.mockResolvedValue(hashedPassword);

    dbMock.get.mockImplementation((sql, params, callback) => {
      callback(null, null); // No user found
    });

    dbMock.run.mockImplementation(function (sql, params, callback) {
      this.lastID = 1; // Simulate last inserted ID
      callback(null); // Simulate successful insertion
    });

    const result = await dao.register(email, password);

    expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    expect(dbMock.get).toHaveBeenCalledWith(
      'SELECT * FROM Users WHERE email = ?',
      [email],
      expect.any(Function)
    );
    expect(dbMock.run).toHaveBeenCalledWith(
      'INSERT INTO Users (email, password, permission, block) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, 'user', 'active'],
      expect.any(Function)
    );
    expect(result).toEqual({ message: 'user inserted' });
  });

  test('login should return a token for valid credentials', async () => {
    const email = 'test@example.com';
    const password = 'password123';
    const user = { user_id: 1, email, password: 'hashedPassword123', permission: 'user', block: 'active' };
    const token = 'mockToken';

    dbMock.get.mockImplementation((sql, params, cb) => cb(null, user)); // User found
    bcrypt.compare.mockResolvedValue(true); // Password matches
    jwt.sign.mockReturnValue(token);

    const result = await dao.login(email, password);

    expect(dbMock.get).toHaveBeenCalledWith(
      'SELECT * FROM Users WHERE email = ?',
      [email],
      expect.any(Function)
    );
    expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
    expect(jwt.sign).toHaveBeenCalledWith(
      { user_id: user.user_id, email: user.email, permission: user.permission },
      'your_jwt_secret',
      { expiresIn: '1h' }
    );
    expect(result).toEqual({ token });
  });

  test('login should reject if user is blocked', async () => {
    const email = 'test@example.com';
    const password = 'password123';
    const user = { user_id: 1, email, password: 'hashedPassword123', permission: 'user', block: 'blocked' };

    dbMock.get.mockImplementation((sql, params, cb) => cb(null, user)); // User found
    bcrypt.compare.mockResolvedValue(true); // Password matches

    await expect(dao.login(email, password)).rejects.toThrow('User is blocked');
    expect(dbMock.get).toHaveBeenCalledWith(
      'SELECT * FROM Users WHERE email = ?',
      [email],
      expect.any(Function)
    );
  });

  test('login should throw an error if the password is invalid', async () => {
    const email = 'test@example.com';
    const password = 'password123';

    dbMock.get.mockImplementation((sql, params, callback) => {
      callback(null, { email, password: 'hashedPassword123', block: 'active' });
    });

    bcrypt.compare.mockResolvedValue(false);

    await expect(dao.login(email, password)).rejects.toThrow('Invalid password');
  });

  test('resetPassword should update the password for valid old password', async () => {
    const user_id = 1;
    const oldPassword = 'oldPassword123';
    const newPassword = 'newPassword123';
    const hashedNewPassword = 'hashedNewPassword123';
    const user = { password: 'hashedOldPassword123' };

    dbMock.get.mockImplementation((sql, params, cb) => cb(null, user)); // User found
    bcrypt.compare.mockResolvedValue(true); // Old password matches
    bcrypt.hash.mockResolvedValue(hashedNewPassword);
    dbMock.run.mockImplementation((sql, params, cb) => cb.call({ changes: 1 }, null)); // Update successful

    const result = await dao.resetPassword(user_id, oldPassword, newPassword);

    expect(dbMock.get).toHaveBeenCalledWith(
      'SELECT password FROM Users WHERE user_id = ?',
      [user_id],
      expect.any(Function)
    );
    expect(bcrypt.compare).toHaveBeenCalledWith(oldPassword, user.password);
    expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
    expect(dbMock.run).toHaveBeenCalledWith(
      'UPDATE Users SET password = ? WHERE user_id = ?',
      [hashedNewPassword, user_id],
      expect.any(Function)
    );
    expect(result).toEqual({ success: true, message: "password changed" });
  });

  test('resetPassword should reject if old password is incorrect', async () => {
    const user_id = 1;
    const oldPassword = 'oldPassword123';
    const newPassword = 'newPassword123';
    const user = { password: 'hashedOldPassword123' };

    dbMock.get.mockImplementation((sql, params, cb) => cb(null, user)); // User found
    bcrypt.compare.mockResolvedValue(false); // Old password does not match

    const result = await dao.resetPassword(user_id, oldPassword, newPassword);

    expect(result).toEqual({ success: false, message: 'Old password is incorrect' });
    expect(bcrypt.compare).toHaveBeenCalledWith(oldPassword, user.password);
  });

  test('resetPassword should throw an error if the old password is incorrect', async () => {
    const userId = 1;
    const oldPassword = 'oldPassword123';
    const newPassword = 'newPassword123';

    dbMock.get.mockImplementation((sql, params, callback) => {
      callback(null, { password: 'hashedOldPassword' });
    });

    bcrypt.compare.mockResolvedValue(false);

    const result = await dao.resetPassword(userId, oldPassword, newPassword);

    expect(result).toEqual({ success: false, message: 'Old password is incorrect' });
  });

  test('resetPassword should update the password successfully', async () => {
    const userId = 1;
    const oldPassword = 'oldPassword123';
    const newPassword = 'newPassword123';
    const hashedNewPassword = 'hashedNewPassword123';

    dbMock.get.mockImplementation((sql, params, callback) => {
      callback(null, { password: 'hashedOldPassword' });
    });

    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue(hashedNewPassword);

    dbMock.run.mockImplementation(function (sql, params, callback) {
      this.changes = 1; // Simulate successful update
      callback(null);
    });

    const result = await dao.resetPassword(userId, oldPassword, newPassword);

    expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
    expect(dbMock.run).toHaveBeenCalledWith(
      'UPDATE Users SET password = ? WHERE user_id = ?',
      [hashedNewPassword, userId],
      expect.any(Function)
    );
    expect(result).toEqual({ success: true, message: 'password changed' });
  });
});