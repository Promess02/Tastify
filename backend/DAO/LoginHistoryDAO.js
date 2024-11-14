const sqlite3 = require('sqlite3').verbose();

class LoginHistoryDAO {
    constructor(dbPath) {
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.log(`komunikat oczekiwany: Failed to connect to database: ${err.message}`);
            } else {
                console.log('komunikat oczekiwany: Connected to the database.');
            }
        });
    }

    logLogin(user_id, time_of_login, login_status) {
        return new Promise((resolve, reject) => {
            console.log(`Oczekiwany komunikat: Logowanie użytkownika o ID: ${user_id} z czasem logowania: ${time_of_login} i statusem logowania: ${login_status}`);
            
            const sql = `
                INSERT INTO LoginHistory (user_id, time_of_login, login_status)
                VALUES (?, ?, ?)`;

            this.db.run(sql, [user_id, time_of_login, login_status], function (err) {
                if (err) {
                    console.error(`Błąd podczas logowania użytkownika o ID: ${user_id}`, err);
                    reject(err);
                } else {
                    console.log(`Zwracany komunikat: Zalogowano użytkownika o ID: ${user_id} z login_id: ${this.lastID}`);
                    resolve({ login_id: this.lastID });
                }
            });
        });
    }

    getLoginHistoryByUser(user_id) {
        return new Promise((resolve, reject) => {
            console.log(`Oczekiwany komunikat: Pobieranie historii logowań dla użytkownika o ID: ${user_id}`);
            
            const sql = 'SELECT * FROM LoginHistory WHERE user_id = ?';
            this.db.all(sql, [user_id], (err, rows) => {
                if (err) {
                    console.error(`Błąd podczas pobierania historii logowań dla użytkownika o ID: ${user_id}`, err);
                    reject(err);
                } else {
                    console.log(`Zwracany komunikat: Znaleziono historię logowań dla użytkownika o ID: ${user_id}: ${JSON.stringify(rows)}`);
                    resolve(rows);
                }
            });
        });
    }
}

module.exports = LoginHistoryDAO;