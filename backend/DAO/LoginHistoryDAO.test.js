jest.mock('sqlite3', () => {
  const mockDbInstance = {
    run: jest.fn(),
    all: jest.fn(),
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

const sqlite3 = require('sqlite3');
const LoginHistoryDAO = require('./LoginHistoryDAO.js'); // Path to your LoginHistoryDAO file

describe('LoginHistoryDAO', () => {
  let dao;
  let dbMock;

  beforeEach(() => {
    // Access the mocked database instance
    dbMock = sqlite3.__mockInstance;

    // Initialize LoginHistoryDAO with a mock database path
    dao = new LoginHistoryDAO(':memory:');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('logLogin should log a login and return the login ID', async () => {
    const user_id = 1;
    const time_of_login = '2023-10-01 12:00:00';
    const login_status = 'success';

    // Mock database behavior
    dbMock.run.mockImplementation(function (sql, params, callback) {
      const self = this; // Simulate `this` context
      self.lastID = 123; // Simulate last inserted ID
      callback(null); // Simulate successful insertion
    });

    const result = await dao.logLogin(user_id, time_of_login, login_status);

    // Assertions
    expect(dbMock.run).toHaveBeenCalledWith(
      `
                INSERT INTO LoginHistory (user_id, time_of_login, login_status)
                VALUES (?, ?, ?)`,
      [user_id, time_of_login, login_status],
      expect.any(Function)
    );
    expect(result).toEqual({ message: "login successful" });
  });

  test('logLogin should reject if there is a database error', async () => {
    const user_id = 1;
    const time_of_login = '2023-10-01 12:00:00';
    const login_status = 'success';
    const mockError = new Error('Database error');

    // Mock database behavior
    dbMock.run.mockImplementation((sql, params, callback) => {
      callback(mockError); // Simulate query failure
    });

    await expect(dao.logLogin(user_id, time_of_login, login_status)).rejects.toThrow('Database error');
    expect(dbMock.run).toHaveBeenCalledWith(
      `
                INSERT INTO LoginHistory (user_id, time_of_login, login_status)
                VALUES (?, ?, ?)`,
      [user_id, time_of_login, login_status],
      expect.any(Function)
    );
  });

  test('getLoginHistoryByUser should return login history for a user', async () => {
    const user_id = 1;
    const mockHistory = [
      { login_id: 1, user_id: 1, time_of_login: '2023-10-01 12:00:00', login_status: 'success' },
      { login_id: 2, user_id: 1, time_of_login: '2023-10-02 14:00:00', login_status: 'failed' },
    ];

    // Mock database behavior
    dbMock.all.mockImplementation((sql, params, callback) => {
      callback(null, mockHistory); // Simulate successful query
    });

    const result = await dao.getLoginHistoryByUser(user_id);

    // Assertions
    expect(dbMock.all).toHaveBeenCalledWith(
      'SELECT * FROM LoginHistory WHERE user_id = ?',
      [user_id],
      expect.any(Function)
    );
    expect(result).toEqual(mockHistory);
  });

  test('getLoginHistoryByUser should reject if there is a database error', async () => {
    const user_id = 1;
    const mockError = new Error('Database error');

    // Mock database behavior
    dbMock.all.mockImplementation((sql, params, callback) => {
      callback(mockError, null); // Simulate query failure
    });

    await expect(dao.getLoginHistoryByUser(user_id)).rejects.toThrow('Database error');
    expect(dbMock.all).toHaveBeenCalledWith(
      'SELECT * FROM LoginHistory WHERE user_id = ?',
      [user_id],
      expect.any(Function)
    );
  });
});