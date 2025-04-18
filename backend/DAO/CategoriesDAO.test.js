jest.mock('sqlite3', () => {
  const mockDbInstance = {
    get: jest.fn(),
    all: jest.fn(),
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
const CategoriesDAO = require('./CategoriesDAO.js'); // Path to your CategoriesDAO file

describe('CategoriesDAO', () => {
  let dao;
  let dbMock;

  beforeEach(() => {
    // Access the mocked database instance
    dbMock = sqlite3.__mockInstance;

    // Initialize CategoriesDAO with a mock database path
    dao = new CategoriesDAO(':memory:');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('addCategory should add a category and return its ID', async () => {
    const categoryName = 'Main Course';
    const mockLastID = 1;

    // Mock database behavior
    dbMock.run.mockImplementation(function (sql, params, callback) {
        this.lastID = mockLastID; // Simulate the last inserted ID
        callback(null); // Simulate successful insertion
    });

    const result = await dao.addCategory(categoryName);

    // Assertions
    expect(dbMock.run).toHaveBeenCalledWith(
        'INSERT INTO Categories (name) VALUES (?)',
        [categoryName],
        expect.any(Function)
    );
    expect(result).toEqual({ message: "category added" });
});

test('addCategory should reject if there is a database error', async () => {
    const categoryName = 'Main Course';
    const mockError = new Error('Database error');

    // Mock database behavior
    dbMock.run.mockImplementation((sql, params, callback) => {
        callback(mockError); // Simulate query failure
    });

    await expect(dao.addCategory(categoryName)).rejects.toThrow('Database error');
});

  test('getCategoryById should return a category by ID', async () => {
    const category_id = 1;
    const mockCategory = { category_id: 1, category_name: 'Main Course' };

    dbMock.get.mockImplementation((sql, params, cb) => cb(null, mockCategory)); // Simulate successful query

    const result = await dao.getCategoryById(category_id);

    expect(result).toEqual(mockCategory);
    expect(dbMock.get).toHaveBeenCalledWith(
      'SELECT * FROM Categories WHERE category_id = ?',
      [category_id],
      expect.any(Function)
    );
  });

  test('getCategoryById should reject if there is an error', async () => {
    const category_id = 1;
    const mockError = new Error('Database error');

    dbMock.get.mockImplementation((sql, params, cb) => cb(mockError, null)); // Simulate query failure

    await expect(dao.getCategoryById(category_id)).rejects.toThrow('Database error');
    expect(dbMock.get).toHaveBeenCalledWith(
      'SELECT * FROM Categories WHERE category_id = ?',
      [category_id],
      expect.any(Function)
    );
  });

  test('getAllDishCategories should return all dish categories', async () => {
    const mockCategories = [
      { category_id: 1, category_name: 'Main Course' },
      { category_id: 2, category_name: 'Dessert' },
    ];

    dbMock.all.mockImplementation((sql, params, cb) => cb(null, mockCategories)); // Simulate successful query

    const result = await dao.getAllDishCategories();

    expect(result).toEqual(mockCategories);
    expect(dbMock.all).toHaveBeenCalledWith(
      'SELECT * FROM Categories where category_type = "dish"',
      [],
      expect.any(Function)
    );
  });

  test('getAllDishCategories should reject if there is an error', async () => {
    const mockError = new Error('Database error');

    dbMock.all.mockImplementation((sql, params, cb) => cb(mockError, null)); // Simulate query failure

    await expect(dao.getAllDishCategories()).rejects.toThrow('Database error');
    expect(dbMock.all).toHaveBeenCalledWith(
      'SELECT * FROM Categories where category_type = "dish"',
      [],
      expect.any(Function)
    );
  });

  test('getAllDietCategories should return all diet categories', async () => {
    const mockCategories = [
      { category_id: 1, category_name: 'Vegan' },
      { category_id: 2, category_name: 'Vegetarian' },
    ];

    dbMock.all.mockImplementation((sql, params, cb) => cb(null, mockCategories)); // Simulate successful query

    const result = await dao.getAllDietCategories();

    expect(result).toEqual(mockCategories);
    expect(dbMock.all).toHaveBeenCalledWith(
      'SELECT * FROM Categories where category_type = "diet"',
      [],
      expect.any(Function)
    );
  });

  test('getAllDietCategories should reject if there is an error', async () => {
    const mockError = new Error('Database error');

    dbMock.all.mockImplementation((sql, params, cb) => cb(mockError, null)); // Simulate query failure

    await expect(dao.getAllDietCategories()).rejects.toThrow('Database error');
    expect(dbMock.all).toHaveBeenCalledWith(
      'SELECT * FROM Categories where category_type = "diet"',
      [],
      expect.any(Function)
    );
  });

  test('deleteCategory should reject if there is an error', async () => {
    const category_id = 1;
    const mockError = new Error('Database error');

    dbMock.run.mockImplementation((sql, params, cb) => cb(mockError)); // Simulate query failure

    await expect(dao.deleteCategory(category_id)).rejects.toThrow('Database error');
    expect(dbMock.run).toHaveBeenCalledWith(
      'DELETE FROM Categories WHERE category_id = ?',
      [category_id],
      expect.any(Function)
    );
  });
});