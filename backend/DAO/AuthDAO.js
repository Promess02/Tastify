const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const LoginHistoryDAO = require('./LoginHistoryDAO');

class AuthDAO {
    constructor(dbPath) {
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.log(`komunikat oczekiwany: Failed to connect to database: ${err.message}`);
            } else {
                console.log('komunikat oczekiwany: Connected to the database.');
            }
        });
        this.loginHistoryDAO = new LoginHistoryDAO(dbPath);
    }

    register(email, password, permission = 'user') {
        return new Promise(async (resolve, reject) => {
            try {
                console.log(`Oczekiwany komunikat: Rejestracja użytkownika z emailem: ${email}`);
                
                const hashedPassword = await bcrypt.hash(password, 10);
                console.log(`Przetwarzany komunikat: Hasło zostało zahashowane dla użytkownika: ${email}`);
                
                const sql = 'INSERT INTO Users (email, password, permission, block) VALUES (?, ?, ?, ?)';
                this.db.run(sql, [email, hashedPassword, permission, 'active'], function (err) {
                    if (err) {
                        console.error(`Błąd podczas rejestracji użytkownika: ${email}`, err);
                        reject(err);
                    } else {
                        console.log(`Zwracany komunikat: Użytkownik zarejestrowany z ID: ${this.lastID}`);
                        resolve({ user_id: this.lastID });
                    }
                });
            } catch (err) {
                console.error(`Błąd podczas przetwarzania rejestracji dla użytkownika: ${email}`, err);
                reject(err);
            }
        });
    }

    login(email, password) {
        return new Promise((resolve, reject) => {
            console.log(`Oczekiwany komunikat: Logowanie użytkownika z emailem: ${email}`);
            
            const sql = 'SELECT * FROM Users WHERE email = ?';
            this.db.get(sql, [email], async (err, user) => {
                if (err) {
                    console.error(`Błąd podczas logowania użytkownika: ${email}`, err);
                    reject(err);
                } else if (!user) {
                    console.warn(`Ostrzeżenie: Użytkownik nie znaleziony: ${email}`);
                    await this.loginHistoryDAO.logLogin(null, new Date().toISOString(), 'failure');
                    reject(new Error('User not found'));
                } else {
                    const isMatch = await bcrypt.compare(password, user.password);
                    if (isMatch) {
                        const token = jwt.sign({ user_id: user.user_id, email: user.email, permission: user.permission }, 'your_jwt_secret', { expiresIn: '1h' });
                        console.log(`Zwracany komunikat: Użytkownik zalogowany, token wygenerowany dla: ${email}`);
                        await this.loginHistoryDAO.logLogin(user.user_id, new Date().toISOString(), 'success');
                        resolve({ token });
                    } else {
                        console.warn(`Ostrzeżenie: Nieprawidłowe hasło dla użytkownika: ${email}`);
                        await this.loginHistoryDAO.logLogin(user.user_id, new Date().toISOString(), 'failure');
                        reject(new Error('Invalid password'));
                    }
                }
            });
        });
    }

    resetPassword(email, newPassword) {
        return new Promise(async (resolve, reject) => {
            try {
                console.log(`Oczekiwany komunikat: Resetowanie hasła dla użytkownika z emailem: ${email}`);
                
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                console.log(`Przetwarzany komunikat: Nowe hasło zostało zahashowane dla użytkownika: ${email}`);
                
                const sql = 'UPDATE Users SET password = ? WHERE email = ?';
                this.db.run(sql, [hashedPassword, email], function (err) {
                    if (err) {
                        console.error(`Błąd podczas resetowania hasła dla użytkownika: ${email}`, err);
                        reject(err);
                    } else {
                        console.log(`Zwracany komunikat: Hasło zresetowane dla użytkownika: ${email}`);
                        resolve({ changes: this.changes });
                    }
                });
            } catch (err) {
                console.error(`Błąd podczas przetwarzania resetowania hasła dla użytkownika: ${email}`, err);
                reject(err);
            }
        });
    }
}

module.exports = AuthDAO;