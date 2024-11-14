const sqlite3 = require('sqlite3').verbose();

class UserDAO {
    constructor(dbPath) {
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.log(`komunikat oczekiwany: Failed to connect to database: ${err.message}`);
            } else {
                console.log('komunikat oczekiwany: Connected to the database.');
            }
        });
    }

    searchUsersByEmail(email) {
        return new Promise((resolve, reject) => {
            console.log(`Oczekiwany komunikat: Wyszukiwanie użytkowników z emailem: ${email}`);
            
            const sql = 'SELECT * FROM Users WHERE email = ?';
            this.db.all(sql, [email], (err, rows) => {
                if (err) {
                    console.error(`Błąd podczas wyszukiwania użytkowników z emailem: ${email}`, err);
                    reject(err);
                } else {
                    console.log(`Zwracany komunikat: Znaleziono użytkowników: ${JSON.stringify(rows)}`);
                    resolve(rows);
                }
            });
        });
    }

    blockUser(userId) {
        return new Promise((resolve, reject) => {
            console.log(`Oczekiwany komunikat: Blokowanie użytkownika z ID: ${userId}`);
            
            const sql = 'UPDATE Users SET block = ? WHERE user_id = ?';
            this.db.run(sql, ['blocked', userId], function (err) {
                if (err) {
                    console.error(`Błąd podczas blokowania użytkownika z ID: ${userId}`, err);
                    reject(err);
                } else {
                    console.log(`Zwracany komunikat: Użytkownik zablokowany, zmiany: ${this.changes}`);
                    resolve({ changes: this.changes });
                }
            });
        });
    }

    unblockUser(userId) {
        return new Promise((resolve, reject) => {
            console.log(`Oczekiwany komunikat: Odblokowywanie użytkownika z ID: ${userId}`);
            
            const sql = 'UPDATE Users SET block = ? WHERE user_id = ?';
            this.db.run(sql, ['active', userId], function (err) {
                if (err) {
                    console.error(`Błąd podczas odblokowywania użytkownika z ID: ${userId}`, err);
                    reject(err);
                } else {
                    console.log(`Zwracany komunikat: Użytkownik odblokowany, zmiany: ${this.changes}`);
                    resolve({ changes: this.changes });
                }
            });
        });
    }

    updateUserPermissions(userId, permission) {
        return new Promise((resolve, reject) => {
            console.log(`Oczekiwany komunikat: Aktualizacja uprawnień użytkownika z ID: ${userId} na ${permission}`);
            
            const sql = 'UPDATE Users SET permission = ? WHERE user_id = ?';
            this.db.run(sql, [permission, userId], function (err) {
                if (err) {
                    console.error(`Błąd podczas aktualizacji uprawnień użytkownika z ID: ${userId}`, err);
                    reject(err);
                } else {
                    console.log(`Zwracany komunikat: Uprawnienia użytkownika zaktualizowane, zmiany: ${this.changes}`);
                    resolve({ changes: this.changes });
                }
            });
        });
    }
}

module.exports = UserDAO;