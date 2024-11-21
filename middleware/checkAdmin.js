// middleware/checkAdmin.js
module.exports = function checkAdmin(req, res, next) {
    if (req.user.permission !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
    next();
};