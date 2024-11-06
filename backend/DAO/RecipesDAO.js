const sqlite3 = require('sqlite3').verbose();

class RecipesDAO {
    constructor(dbPath) {
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.log(`komunikat oczekiwany: Failed to connect to database: ${err.message}`);
            } else {
                console.log('komunikat oczekiwany: Connected to the database.');
            }
        });
    }

    getAllRecipes() {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM Recipes';
            console.log(`komunikat przetwarzany: Executing SQL: ${sql}`);
            this.db.all(sql, [], (err, rows) => {
                if (err) {
                    console.log(`komunikat oczekiwany: Error executing SQL: ${err.message}`);
                    reject(err);
                } else {
                    console.log('komunikat zwracany: Successfully retrieved all recipes.');
                    resolve(rows);
                }
            });
        });
    }

    getRecipeById(recipe_id) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM Recipes WHERE recipe_id = ?';
            console.log(`komunikat przetwarzany: Executing SQL: ${sql} with recipe_id: ${recipe_id}`);
            this.db.get(sql, [recipe_id], (err, row) => {
                if (err) {
                    console.log(`komunikat oczekiwany: Error executing SQL: ${err.message}`);
                    reject(err);
                } else {
                    console.log(`komunikat zwracany: Successfully retrieved recipe with id: ${recipe_id}`);
                    resolve(row);
                }
            });
        });
    }

    createRecipe(recipe) {
        return new Promise((resolve, reject) => {
            const {
                recipe_name,
                ingredients,
                instructions,
                prepare_time,
                dish_category_id,
                diet_category_id,
                calories,
                image_path,
                num_of_portions,
                update_date,
                author_id
            } = recipe;

            const sql = `
                INSERT INTO Recipes (recipe_name, ingredients, instructions, prepare_time, dish_category_id, diet_category_id, calories, image_path, num_of_portions, update_date, author_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            const params = [recipe_name, ingredients, instructions, prepare_time, dish_category_id, diet_category_id, calories, image_path, num_of_portions, update_date, author_id];

            console.log(`komunikat przetwarzany: Executing SQL: ${sql} with params ${JSON.stringify(params)}`);
            this.db.run(sql, params, function (err) {
                if (err) {
                    console.log(`komunikat oczekiwany: Error executing SQL: ${err.message}`);
                    reject(err);
                } else {
                    console.log(`komunikat zwracany: Successfully created recipe with id: ${this.lastID}`);
                    resolve({ recipe_id: this.lastID });
                }
            });
        });
    }

    searchRecipesByName(name) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM Recipes WHERE recipe_name LIKE ?';
            console.log(`komunikat przetwarzany: Executing SQL: ${sql} with name: ${name}`);
            this.db.all(sql, [`%${name}%`], (err, rows) => {
                if (err) {
                    console.log(`komunikat oczekiwany: Error executing SQL: ${err.message}`);
                    reject(err);
                } else {
                    console.log(`komunikat zwracany: Successfully searched recipes by name: ${name}`);
                    resolve(rows);
                }
            });
        });
    }

    searchRecipesByParams(diet, calories, category) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT * FROM Recipes
                WHERE diet_category_id = ? AND calories <= ? AND dish_category_id = ?`;
            console.log(`komunikat przetwarzany: Executing SQL: ${sql} with params: diet=${diet}, calories=${calories}, category=${category}`);
            this.db.all(sql, [diet, calories, category], (err, rows) => {
                if (err) {
                    console.log(`komunikat oczekiwany: Error executing SQL: ${err.message}`);
                    reject(err);
                } else {
                    console.log(`komunikat zwracany: Successfully searched recipes by params: diet=${diet}, calories=${calories}, category=${category}`);
                    resolve(rows);
                }
            });
        });
    }

    updateRecipe(recipe_id, recipe) {
        return new Promise((resolve, reject) => {
            const {
                recipe_name,
                ingredients,
                instructions,
                prepare_time,
                dish_category_id,
                diet_category_id,
                calories,
                image_path,
                num_of_portions,
                update_date,
                author_id
            } = recipe;

            const sql = `
                UPDATE Recipes
                SET recipe_name = ?, ingredients = ?, instructions = ?, prepare_time = ?, dish_category_id = ?, diet_category_id = ?, calories = ?, image_path = ?, num_of_portions = ?, update_date = ?, author_id = ?
                WHERE recipe_id = ?`;

            const params = [recipe_name, ingredients, instructions, prepare_time, dish_category_id, diet_category_id, calories, image_path, num_of_portions, update_date, author_id, recipe_id];

            console.log(`komunikat przetwarzany: Executing SQL: ${sql} with params: ${JSON.stringify(params)}`);
            this.db.run(sql, params, function (err) {
                if (err) {
                    console.log(`komunikat oczekiwany: Error executing SQL: ${err.message}`);
                    reject(err);
                } else {
                    console.log(`komunikat zwracany: Successfully updated recipe with id: ${recipe_id}`);
                    resolve({ updated: this.changes });
                }
            });
        });
    }

    deleteRecipe(recipe_id) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM Recipes WHERE recipe_id = ?';
            console.log(`komunikat przetwarzany: Executing SQL: ${sql} with recipe_id: ${recipe_id}`);
            this.db.run(sql, [recipe_id], function (err) {
                if (err) {
                    console.log(`komunikat oczekiwany: Error executing SQL: ${err.message}`);
                    reject(err);
                } else {
                    console.log(`komunikat zwracany: Successfully deleted recipe with id: ${recipe_id}`);
                    resolve({ deleted: this.changes });
                }
            });
        });
    }
}

module.exports = RecipesDAO;