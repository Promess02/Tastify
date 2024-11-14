const express = require('express');
const cors = require('cors');
const RecipesDAO = require('./DAO/RecipesDAO');
const AuthDAO = require('./DAO/AuthDAO');
const authenticateToken = require('../middleware/auth');
const app = express();

const dbPath = 'C:\\Users\\miko2\\OneDrive\\Dokumenty\\SSI\\Projekt_SSI\\Tastify\\recipeApp.db';
const recipesDAO = new RecipesDAO(dbPath);
const authDAO = new AuthDAO(dbPath);

app.use(cors());
app.use(express.json());

app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await authDAO.register(email, password);
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const token = await authDAO.login(email, password);
        res.json(token);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/recipes', authenticateToken, async (req, res) => {
    try {
        const recipes = await recipesDAO.getAllRecipes();
        res.json({ recipes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(4000, () => {
    console.log('Server is running on port 4000');
});
