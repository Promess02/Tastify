const express = require('express');
const cors = require('cors');
const RecipesDAO = require('./DAO/RecipesDAO');
const app = express();

const dbPath = '/home/mikolajmichalczyk/Documents/sqlite/recipeApp.db';
const recipesDAO = new RecipesDAO(dbPath);

app.use(cors());

app.get('/recipes', async (req, res) => {
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
