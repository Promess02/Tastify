class FavoriteRecipesDAO {
    constructor(dbPath) {
        this.db = new sqlite3.Database(dbPath);
    }

    getFavoritesByUser(user_id) {
        return new Promise((resolve, reject) => {
            console.log(`Oczekiwany komunikat: Pobieranie ulubionych przepisów dla użytkownika o ID: ${user_id}`);
            
            const sql = `
                SELECT Recipes.recipe_name, FavoriteRecipes.update_date
                FROM FavoriteRecipes
                JOIN Recipes ON FavoriteRecipes.recipe_id = Recipes.recipe_id
                WHERE FavoriteRecipes.user_id = ?`;

            this.db.all(sql, [user_id], (err, rows) => {
                if (err) {
                    console.error(`Błąd podczas pobierania ulubionych przepisów dla użytkownika o ID: ${user_id}`, err);
                    reject(err);
                } else {
                    console.log(`Zwracany komunikat: Znaleziono ulubione przepisy dla użytkownika o ID: ${user_id}: ${JSON.stringify(rows)}`);
                    resolve(rows);
                }
            });
        });
    }

    addFavorite(user_id, recipe_id, update_date) {
        return new Promise((resolve, reject) => {
            console.log(`Oczekiwany komunikat: Dodawanie ulubionego przepisu o ID: ${recipe_id} dla użytkownika o ID: ${user_id}`);
            
            const sql = `
                INSERT INTO FavoriteRecipes (user_id, recipe_id, update_date)
                VALUES (?, ?, ?)`;

            this.db.run(sql, [user_id, recipe_id, update_date], function (err) {
                if (err) {
                    console.error(`Błąd podczas dodawania ulubionego przepisu o ID: ${recipe_id} dla użytkownika o ID: ${user_id}`, err);
                    reject(err);
                } else {
                    console.log(`Zwracany komunikat: Dodano ulubiony przepis o ID: ${recipe_id} dla użytkownika o ID: ${user_id}`);
                    resolve({ favorite_id: this.lastID });
                }
            });
        });
    }

    async updateFavorites(user_id, favorites) {
        return new Promise(async (resolve, reject) => {
            console.log(`Oczekiwany komunikat: Rozpoczynanie aktualizacji ulubionych przepisów dla użytkownika o ID: ${user_id}`);
            
            try {
                await this.db.run('BEGIN TRANSACTION');

                await new Promise((resolve, reject) => {
                    const sql = 'DELETE FROM FavoriteRecipes WHERE user_id = ?';
                    this.db.run(sql, [user_id], (err) => {
                        if (err) {
                            console.error(`Błąd podczas usuwania ulubionych przepisów dla użytkownika o ID: ${user_id}`, err);
                            reject(err);
                        } else {
                            console.log(`Zwracany komunikat: Usunięto ulubione przepisy dla użytkownika o ID: ${user_id}`);
                            resolve();
                        }
                    });
                });

                for (const favorite of favorites) {
                    const { recipe_id, update_date } = favorite;
                    await new Promise((resolve, reject) => {
                        const sql = `
                            INSERT INTO FavoriteRecipes (user_id, recipe_id, update_date)
                            VALUES (?, ?, ?)`;
                        this.db.run(sql, [user_id, recipe_id, update_date], function (err) {
                            if (err) {
                                console.error(`Błąd podczas dodawania ulubionego przepisu o ID: ${recipe_id} dla użytkownika o ID: ${user_id}`, err);
                                reject(err);
                            } else {
                                console.log(`Zwracany komunikat: Dodano ulubiony przepis o ID: ${recipe_id} dla użytkownika o ID: ${user_id}`);
                                resolve();
                            }
                        });
                    });
                }

                await this.db.run('COMMIT');
                console.log(`Zwracany komunikat: Ulubione przepisy zaktualizowane pomyślnie dla użytkownika o ID: ${user_id}`);
                resolve({ message: 'Favorites updated successfully' });
            } catch (err) {
                await this.db.run('ROLLBACK');
                console.error(`Błąd podczas aktualizacji ulubionych przepisów dla użytkownika o ID: ${user_id}`, err);
                reject(err);
            }
        });
    }

    removeFavorite(user_id, recipe_id) {
        return new Promise((resolve, reject) => {
            console.log(`Oczekiwany komunikat: Usuwanie ulubionego przepisu o ID: ${recipe_id} dla użytkownika o ID: ${user_id}`);
            
            const sql = 'DELETE FROM FavoriteRecipes WHERE user_id = ? AND recipe_id = ?';
            this.db.run(sql, [user_id, recipe_id], function (err) {
                if (err) {
                    console.error(`Błąd podczas usuwania ulubionego przepisu o ID: ${recipe_id} dla użytkownika o ID: ${user_id}`, err);
                    reject(err);
                } else {
                    console.log(`Zwracany komunikat: Usunięto ulubiony przepis o ID: ${recipe_id} dla użytkownika o ID: ${user_id}, zmiany: ${this.changes}`);
                    resolve({ deleted: this.changes });
                }
            });
        });
    }
}

module.exports = FavoriteRecipesDAO;
