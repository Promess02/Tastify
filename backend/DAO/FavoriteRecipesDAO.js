const sqlite3 = require('sqlite3');

class FavoriteRecipesDAO {
    constructor(dbPath) {
        this.db = new sqlite3.Database(dbPath);
    }

    getFavoritesByUser(user_id) {
        return new Promise((resolve, reject) => {
            
            const sql = `
                SELECT Recipes.recipe_name, Recipes.recipe_id
                FROM FavoriteRecipes
                JOIN Recipes ON FavoriteRecipes.recipe_id = Recipes.recipe_id
                WHERE FavoriteRecipes.user_id = ?`;

            this.db.all(sql, [user_id], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    addFavorite(user_id, recipe_id, update_date) {
        return new Promise((resolve, reject) => {
            
            const sql = `
                INSERT INTO FavoriteRecipes (user_id, recipe_id, update_date)
                VALUES (?, ?, ?)`;

            this.db.run(sql, [user_id, recipe_id, update_date], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ message: "favourite added" });
                }
            });
        });
    }

    async updateFavorites(user_id, favorites) {
        return new Promise(async (resolve, reject) => {            
            try {
                await new Promise((resolve, reject) => {
                    this.db.run('BEGIN TRANSACTION', (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });

                await new Promise((resolve, reject) => {
                    const sql = 'DELETE FROM FavoriteRecipes WHERE user_id = ?';
                    this.db.run(sql, [user_id], (err) => {
                        if (err) reject(new Error('Deletion failed'));
                        else resolve();
                    });
                });

                for (const favorite of favorites) {
                    const { recipe_id, update_date } = favorite;
                    await new Promise((resolve, reject) => {
                        const sql = `
                            INSERT INTO FavoriteRecipes (user_id, recipe_id, update_date)
                            VALUES (?, ?, ?)`;
                        this.db.run(sql, [user_id, recipe_id, update_date], (err) => {
                            if (err) reject(new Error('Insertion failed'));
                            else resolve();
                        });
                    });
                }

                await new Promise((resolve, reject) => {
                    this.db.run('COMMIT', (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
    
                resolve({ message: 'Favorites updated successfully' });
            } catch (err) {
                 // Rollback transaction on error
                await new Promise((resolve, reject) => {
                    this.db.run('ROLLBACK', (rollbackErr) => {
                        if (rollbackErr) reject(rollbackErr);
                        else resolve();
                    });
                });
                reject(err);
            }
        });
    }

    removeFavorite(user_id, recipe_id) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM FavoriteRecipes WHERE user_id = ? AND recipe_id = ?';
            let changes = 'user_id: ' + user_id + ", recipe_id" + recipe_id;
            this.db.run(sql, [user_id, recipe_id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ deleted: changes });
                }
            });
        });
    }
}

module.exports = FavoriteRecipesDAO;
