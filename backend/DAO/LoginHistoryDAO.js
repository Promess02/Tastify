const sqlite3 = require('sqlite3');

class LoginHistoryDAO {
    constructor(dbPath) {
        this.db = new sqlite3.Database(dbPath);
    }

    logLogin(user_id, time_of_login, login_status) {
        return new Promise((resolve, reject) => {            
            const sql = `
                INSERT INTO LoginHistory (user_id, time_of_login, login_status)
                VALUES (?, ?, ?)`;

            this.db.run(sql, [user_id, time_of_login, login_status], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ message: "login successful" });
                }
            });
        });
    }

    getLoginHistoryByUser(user_id) {
        return new Promise((resolve, reject) => {            
            const sql = 'SELECT * FROM LoginHistory WHERE user_id = ?';
            this.db.all(sql, [user_id], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
}

module.exports = LoginHistoryDAO;