const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const LoginHistoryDAO = require('./LoginHistoryDAO');

class AuthDAO {
    constructor(dbPath) {
        this.db = new sqlite3.Database(dbPath);
        this.loginHistoryDAO = new LoginHistoryDAO(dbPath);
    }

    register(email, password, permission = 'user') {
        return new Promise(async (resolve, reject) => {
            try {                
                // Check if user with the given email already exists
                const checkUserSql = 'SELECT * FROM Users WHERE email = ?';
                this.db.get(checkUserSql, [email], async (err, user) => {
                    if (err) {
                        reject(err);
                    } else if (user) {
                        reject(new Error('User with email already registered'));
                    } else {
                        // Hash the password
                        const hashedPassword = await bcrypt.hash(password, 10);                        
                        // Insert the new user
                        const sql = 'INSERT INTO Users (email, password, permission, block) VALUES (?, ?, ?, ?)';
                        this.db.run(sql, [email, hashedPassword, permission, 'active'], function (err) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve({ message: "user inserted" });
                            }
                        });
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    login(email, password) {
        return new Promise((resolve, reject) => {            
            const sql = 'SELECT * FROM Users WHERE email = ?';
            this.db.get(sql, [email], async (err, user) => {
                if (err) {
                    reject(err);
                } else if (!user) {
                    reject(new Error('User not found'));
                } else {
                    const isMatch = await bcrypt.compare(password, user.password);
                    if (isMatch) {
                        if (user.block === 'blocked') {
                            reject(new Error('User is blocked'));
                        } else {
                            const token = jwt.sign({ user_id: user.user_id, email: user.email, permission: user.permission }, 'your_jwt_secret', { expiresIn: '1h' });
                            await this.loginHistoryDAO.logLogin(user.user_id, new Date().toISOString(), 'success');
                            resolve({ token });
                        } 
                    } else {
                        await this.loginHistoryDAO.logLogin(user.user_id, new Date().toISOString(), 'failure');
                        reject(new Error('Invalid password'));
                    }
                }
            });
        });
    }

    resetPassword(user_id, oldPassword, newPassword) {
        return new Promise(async (resolve, reject) => {
            try {                
                const sqlSelect = 'SELECT password FROM Users WHERE user_id = ?';
                this.db.get(sqlSelect, [user_id], async (err, row) => {
                    if (err) {
                        return reject(err);
                    }
    
                    if (!row) {
                        return resolve({ success: false, message: 'User not found' });
                    }
    
                    const isMatch = await bcrypt.compare(oldPassword, row.password);
                    if (!isMatch) {
                        return resolve({ success: false, message: 'Old password is incorrect' });
                    }
                    
                    const hashedPassword = await bcrypt.hash(newPassword, 10);

                    const sqlUpdate = 'UPDATE Users SET password = ? WHERE user_id = ?';
                    this.db.run(sqlUpdate, [hashedPassword, user_id], function (err) {
                        if (err) {
                            return reject(err);
                        } else {
                            return resolve({ success: true, message: "password changed" });
                        }
                    });
                });
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = AuthDAO;