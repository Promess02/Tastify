const sqlite3 = require('sqlite3');
class CategoriesDAO {
    constructor(dbPath) {
        this.db = new sqlite3.Database(dbPath);
    }

    addCategory(name) {
        return new Promise((resolve, reject) => {            
            const sql = 'INSERT INTO Categories (name) VALUES (?)';
            this.db.run(sql, [name], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ message: "category added" });
                }
            });
        });
    }

    getCategoryById(category_id) {
        return new Promise((resolve, reject) => {            
            const sql = 'SELECT * FROM Categories WHERE category_id = ?';
            this.db.get(sql, [category_id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    getAllDishCategories() {
        return new Promise((resolve, reject) => {            
            const sql = 'SELECT * FROM Categories where category_type = "dish"';
            this.db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    getAllDietCategories() {
        return new Promise((resolve, reject) => {            
            const sql = 'SELECT * FROM Categories where category_type = "diet"';
            this.db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    deleteCategory(category_id) {
        return new Promise((resolve, reject) => {            
            const sql = 'DELETE FROM Categories WHERE category_id = ?';
            this.db.run(sql, [category_id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    }
}

module.exports = CategoriesDAO;