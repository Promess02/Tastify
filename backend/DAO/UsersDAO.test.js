jest.mock('sqlite3', () => {
  const mockDbInstance = {
    all: jest.fn(),
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

const sqlite3 = require('sqlite3');
const UsersDAO = require('./UsersDao.js'); // Path to your UsersDAO file

describe('UsersDAO', () => {
  let dao;
  let dbMock;

  beforeEach(() => {
    // Access the mocked database instance
    dbMock = sqlite3.__mockInstance;

    // Initialize UsersDAO with a mock database path
    dao = new UsersDAO(':memory:');
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getAllUsers should return all users', async () => {
    const mockUsers = [
      { user_id: 1, email: 'user1@example.com' },
      { user_id: 2, email: 'user2@example.com' },
    ];

    // Mock database behavior
    dbMock.all.mockImplementation((sql, params, callback) => {
      callback(null, mockUsers); // Simulate successful query
    });

    const result = await dao.getAllUsers();

    // Assertions
    expect(dbMock.all).toHaveBeenCalledWith('SELECT * FROM Users', [], expect.any(Function));
    expect(result).toEqual(mockUsers);
});

  test('getUserByEmail should return a user by email', async () => {
    const email = 'user1@example.com';
    const mockUser = { user_id: 1, email: 'user1@example.com' };

    // Mock database behavior
    dbMock.all.mockImplementation((sql, params, callback) => {
        callback(null, [mockUser]); // Simulate successful query
    });

    const result = await dao.getUserByEmail(email);

    // Assertions
    expect(dbMock.all).toHaveBeenCalledWith(
        'SELECT * FROM Users WHERE email = ?',
        [email],
        expect.any(Function)
    );
    expect(result).toEqual([mockUser]);
});

test('getUserByEmail should throw an error if the query fails', async () => {
    const email = 'user1@example.com';
    const mockError = new Error('Database error');

    // Mock database behavior
    dbMock.all.mockImplementation((sql, params, callback) => {
        callback(mockError, null); // Simulate query failure
    });

    await expect(dao.getUserByEmail(email)).rejects.toThrow('Database error');
});

test('blockUser should block a user by ID', async () => {
    const userId = 1;

    // Mock database behavior
    dbMock.run.mockImplementation((sql, params, callback) => {
        callback(null); // Simulate successful update
    });

    const result = await dao.blockUser(userId);

    // Assertions
    expect(dbMock.run).toHaveBeenCalledWith(
        'UPDATE Users SET block = ? WHERE user_id = ?',
        ['blocked', userId],
        expect.any(Function)
    );
    expect(result).toEqual({ message: "user with id: " + userId + " blocked"});
});

test('unblockUser should unblock a user by ID', async () => {
    const userId = 1;

    // Mock database behavior
    dbMock.run.mockImplementation((sql, params, callback) => {
        callback(null); // Simulate successful update
    });

    const result = await dao.unblockUser(userId);

    // Assertions
    expect(dbMock.run).toHaveBeenCalledWith(
        'UPDATE Users SET block = ? WHERE user_id = ?',
        ['active', userId],
        expect.any(Function)
    );
    expect(result).toEqual({ message: "user with id: " + userId + " unblocked"});
});

test('updateUserPermissions should update user permissions', async () => {
    const userId = 1;
    const permission = 'admin';

    // Mock database behavior
    dbMock.run.mockImplementation((sql, params, callback) => {
        callback(null); // Simulate successful update
    });

    const result = await dao.updateUserPermissions(userId, permission);

    // Assertions
    expect(dbMock.run).toHaveBeenCalledWith(
        'UPDATE Users SET permission = ? WHERE user_id = ?',
        [permission, userId],
        expect.any(Function)
    );
    expect(result).toEqual({  message: "user with id: " + userId + "permission changed to: " + permission });
});

test('blockUser should throw an error if the query fails', async () => {
    const userId = 1;
    const mockError = new Error('Database error');

    // Mock database behavior
    dbMock.run.mockImplementation((sql, params, callback) => {
        callback(mockError); // Simulate query failure
    });

    await expect(dao.blockUser(userId)).rejects.toThrow('Database error');
});

test('unblockUser should throw an error if the query fails', async () => {
    const userId = 1;
    const mockError = new Error('Database error');

    // Mock database behavior
    dbMock.run.mockImplementation((sql, params, callback) => {
        callback(mockError); // Simulate query failure
    });

    await expect(dao.unblockUser(userId)).rejects.toThrow('Database error');
});

test('updateUserPermissions should throw an error if the query fails', async () => {
    const userId = 1;
    const permission = 'admin';
    const mockError = new Error('Database error');

    // Mock database behavior
    dbMock.run.mockImplementation((sql, params, callback) => {
        callback(mockError); // Simulate query failure
    });

    await expect(dao.updateUserPermissions(userId, permission)).rejects.toThrow('Database error');
});

test('blockUser should block a user by ID', async () => {
    const userId = 1;

    // Mock database behavior
    dbMock.run.mockImplementation((sql, params, callback) => {
        callback(null); // Simulate successful update
    });

    const result = await dao.blockUser(userId);

    // Assertions
    expect(dbMock.run).toHaveBeenCalledWith(
        'UPDATE Users SET block = ? WHERE user_id = ?',
        ['blocked', userId],
        expect.any(Function)
    );
    expect(result).toEqual({ message: "user with id: " + userId + " blocked" });
});

test('unblockUser should unblock a user by ID', async () => {
    const userId = 1;

    // Mock database behavior
    dbMock.run.mockImplementation((sql, params, callback) => {
        callback(null); // Simulate successful update
    });

    const result = await dao.unblockUser(userId);

    // Assertions
    expect(dbMock.run).toHaveBeenCalledWith(
        'UPDATE Users SET block = ? WHERE user_id = ?',
        ['active', userId],
        expect.any(Function)
    );
    expect(result).toEqual({ message: "user with id: " + userId + " unblocked"});
});

test('updateUserPermissions should update user permissions', async () => {
    const userId = 1;
    const permission = 'admin';

    // Mock database behavior
    dbMock.run.mockImplementation((sql, params, callback) => {
        callback(null); // Simulate successful update
    });

    const result = await dao.updateUserPermissions(userId, permission);

    // Assertions
    expect(dbMock.run).toHaveBeenCalledWith(
        'UPDATE Users SET permission = ? WHERE user_id = ?',
        [permission, userId],
        expect.any(Function)
    );
    expect(result).toEqual({ message: "user with id: " + userId + "permission changed to: " + permission });
})
});
