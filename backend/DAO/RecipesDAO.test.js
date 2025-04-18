// RecipesDAO.test.js
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
const RecipesDAO = require('./RecipesDAO.js'); // Path to your RecipesDAO file

describe('RecipesDAO', () => {
  let dao;
  let dbMock;
  beforeEach(() => {
    // Access the shared mocked instance
    dbMock = sqlite3.__mockInstance;
    dao = new RecipesDAO(':memory:');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getAllRecipes should return list of recipes', async () => {
    const mockRecipes = [{ recipe_id: 1, recipe_name: 'Pizza' }];
    dbMock.all.mockImplementation((sql, params, cb) => cb(null, mockRecipes));

    const result = await dao.getAllRecipes();

    expect(result).toEqual(mockRecipes);
    expect(dbMock.all).toHaveBeenCalledWith('SELECT * FROM Recipes', [], expect.any(Function));
  });

  test('getRecipeById should return single recipe', async () => {
    const mockRecipe = { recipe_id: 1, recipe_name: 'Pizza' };
    dbMock.get.mockImplementation((sql, params, cb) => cb(null, mockRecipe));

    const result = await dao.getRecipeById(1);

    expect(result).toEqual(mockRecipe);
    expect(dbMock.get).toHaveBeenCalledWith(
      'SELECT * FROM Recipes WHERE recipe_id = ?',
      [1],
      expect.any(Function)
    );
  });

  test('createRecipe should insert and return new id', async () => {
    const recipe = {
      recipe_name: 'Salad',
      ingredients: 'lettuce',
      instructions: 'mix',
      prepare_time: 5,
      dish_category_id: 1,
      diet_category_id: 2,
      calories: 150,
      image_path: '/img.png',
      num_of_portions: 2,
      update_date: '2024-04-01',
      author_id: 10,
    };

    dbMock.run.mockImplementation((sql, params, cb) => {
      cb.call({ lastID: 123 }, null);
    });

    const result = await dao.createRecipe(recipe);

    expect(result).toEqual({ recipe_id: 123 });
    expect(dbMock.run).toHaveBeenCalled();
  });

  test('searchRecipesByName should return matching recipes', async () => {
    const mockRecipes = [{ recipe_id: 2, recipe_name: 'Pasta' }];
    dbMock.all.mockImplementation((sql, params, cb) => cb(null, mockRecipes));

    const result = await dao.searchRecipesByName('Pas');

    expect(result).toEqual(mockRecipes);
    expect(dbMock.all).toHaveBeenCalledWith(
      'SELECT * FROM Recipes WHERE recipe_name LIKE ?',
      ['%Pas%'],
      expect.any(Function)
    );
  });

  test('searchRecipesByParams should return filtered recipes', async () => {
    const mockRecipes = [{ recipe_id: 3, recipe_name: 'Vegan Curry' }];
    dbMock.all.mockImplementation((sql, params, cb) => cb(null, mockRecipes));

    const result = await dao.searchRecipesByParams(2, 500, 1);

    expect(result).toEqual(mockRecipes);
    expect(dbMock.all).toHaveBeenCalledWith(
      expect.any(String),
      [2, 500, 1],
      expect.any(Function)
    );
  });

  test('updateRecipe should resolve with number of changes', async () => {
    const recipe = {
      recipe_name: 'Updated',
      ingredients: 'x',
      instructions: 'y',
      prepare_time: 10,
      dish_category_id: 1,
      diet_category_id: 1,
      calories: 200,
      image_path: '',
      num_of_portions: 1,
      update_date: '2024-04-01',
      author_id: 1,
    };

    dbMock.run.mockImplementation((sql, params, cb) => {
      cb.call({ changes: 1 }, null);
    });

    const result = await dao.updateRecipe(1, recipe);

    expect(result).toEqual({ updated: 1 });
  });

  test('deleteRecipe should resolve with number of deletions', async () => {
    dbMock.run.mockImplementation((sql, params, cb) => {
      cb.call({ changes: 1 }, null);
    });

    const result = await dao.deleteRecipe(1);

    expect(result).toEqual({ deleted: 1 });
  });

  test('should handle errors in getAllRecipes', async () => {
    dbMock.all.mockImplementation((sql, params, cb) => cb(new Error('DB error')));

    await expect(dao.getAllRecipes()).rejects.toThrow('DB error');
  });
});
