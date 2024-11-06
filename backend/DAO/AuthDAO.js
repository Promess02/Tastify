const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthDAO {
    constructor(db) {
        this.db = db;
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
                    reject(new Error('User not found'));
                } else {
                    const isMatch = await bcrypt.compare(password, user.password);
                    if (isMatch) {
                        const token = jwt.sign({ user_id: user.user_id, email: user.email, permission: user.permission }, 'your_jwt_secret', { expiresIn: '1h' });
                        console.log(`Zwracany komunikat: Użytkownik zalogowany, token wygenerowany dla: ${email}`);
                        resolve({ token });
                    } else {
                        console.warn(`Ostrzeżenie: Nieprawidłowe hasło dla użytkownika: ${email}`);
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