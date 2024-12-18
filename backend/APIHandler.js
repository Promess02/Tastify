const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth.js');
const checkAdmin = require('../middleware/checkAdmin.js');
const RecipesDAO = require('./DAO/RecipesDAO.js');
const CategoriesDAO = require('./DAO/CategoriesDAO.js');
const AuthDAO = require('./DAO/AuthDAO.js');
const UserDAO = require('./DAO/UsersDao.js');
const FavoriteRecipesDAO = require('./DAO/FavoriteRecipesDAO');
const multer = require('multer');
const fs = require('fs');
const path = require('path');


const dbPath = '../recipeApp.db';
const recipesDAO = new RecipesDAO(dbPath);
const categoriesDAO = new CategoriesDAO(dbPath);
const authDAO = new AuthDAO(dbPath);
const userDAO = new UserDAO(dbPath);
const favoriteRecipesDAO = new FavoriteRecipesDAO(dbPath);

// 1. pobiera wszystkie przepisy
router.get('/recipes', async (req, res) => {
    try {
        const recipes = await recipesDAO.getAllRecipes();
        res.json({ recipes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. wyszukuje przepisy po nazwie
router.get('/recipes/search/name', authenticateToken, async (req, res) => {
    const { name } = req.query;
    try {
        const recipes = await recipesDAO.searchRecipesByName(name);
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. wyszukuje przepisy po kategoriach
router.get('/recipes/search/params', authenticateToken, async (req, res) => {
    const { diet, calories, category } = req.query;
    try {
        const recipes = await recipesDAO.searchRecipesByParams(diet, calories, category);
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/recipes/getDishCategories', async (req, res) => {
    try {
        const categories = await categoriesDAO.getAllDishCategories();
        res.json({categories});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/recipes/getDietCategories', async (req, res) => {
    try {
        const categories = await categoriesDAO.getAllDietCategories();
        res.json({categories});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Dodaj ulubiony przepis
router.post('/favorites', authenticateToken, async (req, res) => {
    const { recipe_id } = req.body;
    const user_id = req.user.user_id;
    try {
        const favorite = await favoriteRecipesDAO.addFavorite(user_id, recipe_id, new Date().toISOString());
        res.json(favorite);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Pobierz ulubione przepisy użytkownika
router.get('/favorites', authenticateToken, async (req, res) => {
    const user_id = req.user.user_id;
    try {
        const favorites = await favoriteRecipesDAO.getFavoritesByUser(user_id);
        res.json(favorites);
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log(err + 'USER_ERROR');
    }
});

// 6. a. Zmień ulubiony przepis
router.put('/favorites', authenticateToken, async (req, res) => {
    const { recipe_id } = req.body;
    const user_id = req.user.user_id;
    try {
        const favorites = await favoriteRecipesDAO.getFavoriteRecipes(user_id);
        const isFavorite = favorites.some(favorite => favorite.recipe_id === recipe_id);

        let result;
        if (isFavorite) {
            result = await favoriteRecipesDAO.removeFavoriteRecipe(user_id, recipe_id);
        } else {
            result = await favoriteRecipesDAO.addFavoriteRecipe(user_id, recipe_id);
        }

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. b. Usuń ulubiony przepis
router.delete('/favorites', authenticateToken, async (req, res) => {
    const { recipe_id } = req.body;
    const user_id = req.user.user_id;
    try {
        const result = await favoriteRecipesDAO.removeFavorite(user_id, recipe_id);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. dodaje przepis
router.post('/recipes', authenticateToken, async (req, res) => {
    const recipe = req.body;
    try {
        const newRecipe = await recipesDAO.createRecipe(recipe);
        res.json(newRecipe);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = '../recipe-app/public/images/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const imageName = req.body.imageName || file.originalname;
        const ext = path.extname(file.originalname);
        if (!/\.(jpg|jpeg|png)$/i.test(imageName)) {
            imageName += ext;
        }
        const filePath = path.join(__dirname, '../recipe-app/public/images/', imageName);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); // Delete the existing file
        }
        cb(null, imageName);
    }
});

const upload = multer({ storage: storage });

router.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.send({ imagePath: `/images/${req.file.filename}` });
});

// 8. aktualizuje przepis
router.put('/recipes/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const recipe = req.body;
    try {
        const updatedRecipe = await recipesDAO.updateRecipe(id, recipe);
        res.json(updatedRecipe);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 9. usuwa przepis
router.delete('/recipes/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const deletedRecipe = await recipesDAO.deleteRecipe(id);
        res.json(deletedRecipe);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 10. Wyszukiwanie użytkownika po email
router.get('/users/search', authenticateToken, checkAdmin, async (req, res) => {
    const { email } = req.query;
    try {
        const user = await userDAO.getUserByEmail(email);
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/users', authenticateToken, checkAdmin, async (req, res) => {
    try {
        const users = await userDAO.getAllUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 11. Blokowanie użytkownika
router.put('/users/:userId/block', authenticateToken, checkAdmin, async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await userDAO.blockUser(userId);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 11. Odblokowanie użytkownika
router.put('/users/:userId/unblock', authenticateToken, checkAdmin, async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await userDAO.unblockUser(userId);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 12. Zmiana uprawnień użytkowników
router.put('/users/:userId/permissions', authenticateToken, checkAdmin, async (req, res) => {
    const { userId } = req.params;
    const { permission } = req.body;
    try {
        const result = await userDAO.updateUserPermissions(userId, permission);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 13. rejestracja użytkownika
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await authDAO.register(email, password);
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 14. logowanie użytkownika
router.post('/login', async (req, res) => {
    const { email, password} = req.body;
    try {
        const token = await authDAO.login(email, password);
        res.json(token);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 15. Resetowanie hasła
router.post('/auth/reset-password', async (req, res) => {
    const { user_id, oldPassword, newPassword } = req.body;
    try {
        const result = await authDAO.resetPassword(user_id, oldPassword, newPassword);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;