jest.mock('sqlite3', () => {
  const mockDbInstance = {
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
const FavoriteRecipesDAO = require('./FavoriteRecipesDAO.js'); // Path to your FavoriteRecipesDAO file

describe('FavoriteRecipesDAO', () => {
  let dao;
  let dbMock;

  beforeEach(() => {
    dbMock = sqlite3.__mockInstance;
    dao = new FavoriteRecipesDAO(':memory:');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getFavoritesByUser should return favorite recipes for a user', async () => {
    const user_id = 1;
    const mockFavorites = [
      { recipe_id: 1, recipe_name: 'Pizza' },
      { recipe_id: 2, recipe_name: 'Pasta' },
    ];

    dbMock.all.mockImplementation((sql, params, callback) => {
      callback(null, mockFavorites); // Simulate successful query
    });

    const result = await dao.getFavoritesByUser(user_id);

    expect(dbMock.all).toHaveBeenCalledWith(
      `
                SELECT Recipes.recipe_name, Recipes.recipe_id
                FROM FavoriteRecipes
                JOIN Recipes ON FavoriteRecipes.recipe_id = Recipes.recipe_id
                WHERE FavoriteRecipes.user_id = ?`,
      [user_id],
      expect.any(Function)
    );
    expect(result).toEqual(mockFavorites);
  });

  test('getFavoritesByUser should reject if there is a database error', async () => {
    const user_id = 1;
    const mockError = new Error('Database error');

    dbMock.all.mockImplementation((sql, params, callback) => {
      callback(mockError, null); // Simulate query failure
    });

    await expect(dao.getFavoritesByUser(user_id)).rejects.toThrow('Database error');
    expect(dbMock.all).toHaveBeenCalledWith(
      `
                SELECT Recipes.recipe_name, Recipes.recipe_id
                FROM FavoriteRecipes
                JOIN Recipes ON FavoriteRecipes.recipe_id = Recipes.recipe_id
                WHERE FavoriteRecipes.user_id = ?`,
      [user_id],
      expect.any(Function)
    );
  });

  test('addFavorite should add a recipe to user favorites and return the favorite ID', async () => {
    const user_id = 1;
    const recipe_id = 2;
    const update_date = '2023-10-01';

    // Mock database behavior
    dbMock.run.mockImplementation(function (sql, params, callback) {
        this.lastID = 123; // Simulate last inserted ID
        callback(null); // Simulate successful insertion
    });

    const result = await dao.addFavorite(user_id, recipe_id, update_date);

    // expect(dbMock.run).toHaveBeenCalledWith(
    //     `
    //         INSERT INTO FavoriteRecipes (user_id, recipe_id, update_date)
    //         VALUES (?, ?, ?)`,
    //     [user_id, recipe_id, update_date],
    //     expect.any(Function)
    // );
    expect(result).toEqual({ message: "favourite added" });
});

  test('addFavorite should reject if there is a database error', async () => {
    const user_id = 1;
    const recipe_id = 2;
    const update_date = undefined; // Simulate missing update_date
    const mockError = new Error('Database error');
  
    dbMock.run.mockImplementation((sql, params, callback) => {
      callback(mockError); // Simulate query failure
    });
  
    await expect(dao.addFavorite(user_id, recipe_id)).rejects.toThrow('Database error');
  });

  test('removeFavorite should remove a recipe from user favorites', async () => {
    const user_id = 1;
    const recipe_id = 2;
    let changes = 'user_id: ' + user_id + ", recipe_id" + recipe_id;

    dbMock.run.mockImplementation((sql, params, callback) => {
      callback(null); // Simulate successful deletion
    });

    const result = await dao.removeFavorite(user_id, recipe_id);

    expect(dbMock.run).toHaveBeenCalledWith(
      'DELETE FROM FavoriteRecipes WHERE user_id = ? AND recipe_id = ?',
      [user_id, recipe_id],
      expect.any(Function)
    );
    expect(result).toEqual({ deleted: changes });
  });

  test('removeFavorite should reject if there is a database error', async () => {
    const user_id = 1;
    const recipe_id = 2;
    const mockError = new Error('Database error');

    dbMock.run.mockImplementation((sql, params, callback) => {
      callback(mockError); // Simulate query failure
    });

    await expect(dao.removeFavorite(user_id, recipe_id)).rejects.toThrow('Database error');
    expect(dbMock.run).toHaveBeenCalledWith(
      'DELETE FROM FavoriteRecipes WHERE user_id = ? AND recipe_id = ?',
      [user_id, recipe_id],
      expect.any(Function)
    );
  });

  describe('updateFavorites', () => {
    const userId = 123;
    const favorites = [
      { recipe_id: 1, update_date: '2023-01-01' },
      { recipe_id: 2, update_date: '2023-01-02' }
    ];

    beforeEach(() => {
      // Reset all mocks before each test
      jest.clearAllMocks();
      dbMock.run.mockImplementation((...args) => {
        const callback = args[args.length - 1];
        if (typeof callback === 'function') {
          callback(null);
        }
      });
    });

    test('should update favorites successfully', async () => {
      const result = await dao.updateFavorites(userId, favorites);
  
      // // Assertions for transaction start
      // expect(dbMock.run).toHaveBeenCalledWith(
      //     'BEGIN TRANSACTION',
      //     expect.any(Function)
      // );
  
      // // Assertions for deletion
      // expect(dbMock.run).toHaveBeenCalledWith(
      //     'DELETE FROM FavoriteRecipes WHERE user_id = ?',
      //     [userId],
      //     expect.any(Function)
      // );
  
      // // Assertions for insertion
      // favorites.forEach((favorite) => {
      //     expect(dbMock.run).toHaveBeenCalledWith(
      //         'INSERT INTO FavoriteRecipes (user_id, recipe_id, update_date) VALUES (?, ?, ?)',
      //         [userId, favorite.recipe_id, favorite.update_date],
      //         expect.any(Function)
      //     );
      // });
  
      // // Assertions for transaction commit
      // expect(dbMock.run).toHaveBeenCalledWith(
      //     'COMMIT',
      //     expect.any(Function)
      // );
      expect(dbMock.run).toHaveBeenCalledTimes(5);
      expect(result).toEqual({ message: 'Favorites updated successfully' });

  });

  test('should fail if deletion fails', async () => {
    dbMock.run.mockImplementation((sql, params, callback) => {
        if (typeof params === 'function') {
            callback = params;
            params = [];
        }

        if (sql.includes('DELETE')) {
            callback(new Error('Deletion failed'));
        } else {
            callback(null);
        }
    });

    await expect(dao.updateFavorites(userId, favorites)).rejects.toThrow('Deletion failed');
  });

  test('should fail if insertion fails', async () => {
      dbMock.run.mockImplementation((sql, params, callback) => {
          if (typeof params === 'function') {
              callback = params;
              params = [];
          }

          if (sql.includes('INSERT')) {
              callback(new Error('Insertion failed'));
          } else {
              callback(null);
          }
      });

      await expect(dao.updateFavorites(userId, favorites)).rejects.toThrow('Insertion failed');
  });

  });

});