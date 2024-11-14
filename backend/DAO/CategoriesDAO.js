const sqlite3 = require('sqlite3').verbose();
class CategoriesDAO {
    constructor(dbPath) {
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.log(`komunikat oczekiwany: Failed to connect to database: ${err.message}`);
            } else {
                console.log('komunikat oczekiwany: Connected to the database.');
            }
        });
    }

    addCategory(name) {
        return new Promise((resolve, reject) => {
            console.log(`Oczekiwany komunikat: Dodawanie kategorii o nazwie: ${name}`);
            
            const sql = 'INSERT INTO Categories (name) VALUES (?)';
            this.db.run(sql, [name], function (err) {
                if (err) {
                    console.error(`Błąd podczas dodawania kategorii o nazwie: ${name}`, err);
                    reject(err);
                } else {
                    console.log(`Zwracany komunikat: Kategoria dodana z ID: ${this.lastID}`);
                    resolve({ category_id: this.lastID });
                }
            });
        });
    }

    getCategoryById(category_id) {
        return new Promise((resolve, reject) => {
            console.log(`Oczekiwany komunikat: Pobieranie kategorii o ID: ${category_id}`);
            
            const sql = 'SELECT * FROM Categories WHERE category_id = ?';
            this.db.get(sql, [category_id], (err, row) => {
                if (err) {
                    console.error(`Błąd podczas pobierania kategorii o ID: ${category_id}`, err);
                    reject(err);
                } else {
                    console.log(`Zwracany komunikat: Znaleziono kategorię: ${JSON.stringify(row)}`);
                    resolve(row);
                }
            });
        });
    }

    getAllCategories() {
        return new Promise((resolve, reject) => {
            console.log(`Oczekiwany komunikat: Pobieranie wszystkich kategorii`);
            
            const sql = 'SELECT * FROM Categories';
            this.db.all(sql, [], (err, rows) => {
                if (err) {
                    console.error(`Błąd podczas pobierania wszystkich kategorii`, err);
                    reject(err);
                } else {
                    console.log(`Zwracany komunikat: Znaleziono kategorie: ${JSON.stringify(rows)}`);
                    resolve(rows);
                }
            });
        });
    }

    deleteCategory(category_id) {
        return new Promise((resolve, reject) => {
            console.log(`Oczekiwany komunikat: Usuwanie kategorii o ID: ${category_id}`);
            
            const sql = 'DELETE FROM Categories WHERE category_id = ?';
            this.db.run(sql, [category_id], function (err) {
                if (err) {
                    console.error(`Błąd podczas usuwania kategorii o ID: ${category_id}`, err);
                    reject(err);
                } else {
                    console.log(`Zwracany komunikat: Kategoria usunięta, zmiany: ${this.changes}`);
                    resolve({ changes: this.changes });
                }
            });
        });
    }
}

module.exports = CategoriesDAO;