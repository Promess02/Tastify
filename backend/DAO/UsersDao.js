const sqlite3 = require('sqlite3');

class UserDAO {
    constructor(dbPath) {
        this.db = new sqlite3.Database(dbPath);
    }

    getAllUsers() {
        return new Promise((resolve, reject) => {            
            const sql = 'SELECT * FROM Users';
            this.db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    getUserByEmail(email) {
        return new Promise((resolve, reject) => {            
            const sql = 'SELECT * FROM Users WHERE email = ?';
            this.db.all(sql, [email], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    blockUser(userId) {
        return new Promise((resolve, reject) => {            
            const sql = 'UPDATE Users SET block = ? WHERE user_id = ?';
            this.db.run(sql, ['blocked', userId], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ message: "user with id: " + userId + " blocked" });
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
                    reject(err);
                } else {
                    resolve({ message: "user with id: " + userId + " unblocked" });
                }
            });
        });
    }

    updateUserPermissions(userId, permission) {
        return new Promise((resolve, reject) => {            
            const sql = 'UPDATE Users SET permission = ? WHERE user_id = ?';
            this.db.run(sql, [permission, userId], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ message: "user with id: " + userId + "permission changed to: " + permission });
                }
            });
        });
    }
}

module.exports = UserDAO;