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

/**
 * @swagger
 * /recipes:
 *   get:
 *     summary: Pobierz wszystkie przepisy
 *     description: Zwraca listę wszystkich przepisów w bazie danych.
 *     responses:
 *       200:
 *         description: Lista przepisów
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recipes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       recipe_id:
 *                         type: integer
 *                         description: Unikalny identyfikator przepisu
 *                       recipe_name:
 *                         type: string
 *                         description: Nazwa przepisu
 *                       ingredients:
 *                         type: string
 *                         description: Składniki przepisu
 *                       instructions:
 *                         type: string
 *                         description: Instrukcje przygotowania przepisu
 *                       prepare_time:
 *                         type: integer
 *                         description: Czas przygotowania przepisu w minutach
 *                       dish_category_id:
 *                         type: integer
 *                         description: ID kategorii dania
 *                       diet_category_id:
 *                         type: integer
 *                         description: ID kategorii diety
 *                       calories:
 *                         type: integer
 *                         description: Liczba kalorii w przepisie
 *                       image_path:
 *                         type: string
 *                         description: Ścieżka do obrazu przepisu
 *                       num_of_portions:
 *                         type: integer
 *                         description: Liczba porcji, które można przygotować z przepisu
 *                       update_date:
 *                         type: string
 *                         format: date
 *                         description: Data ostatniej aktualizacji przepisu
 *                       author_id:
 *                         type: integer
 *                         description: ID autora przepisu  
 */
router.get('/recipes', async (req, res) => {
    try {
        const recipes = await recipesDAO.getAllRecipes();
        res.json({ recipes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /recipes/search/name:
 *   get:
 *     summary: Wyszukaj przepisy po nazwie
 *     description: Zwraca przepisy, które pasują do podanej nazwy.
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Nazwa przepisu do wyszukania
 *     responses:
 *       200:
 *         description: Lista pasujących przepisów
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recipes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       recipe_id:
 *                         type: integer
 *                         description: Unikalny identyfikator przepisu
 *                       recipe_name:
 *                         type: string
 *                         description: Nazwa przepisu
 *                       ingredients:
 *                         type: string
 *                         description: Składniki przepisu
 *                       instructions:
 *                         type: string
 *                         description: Instrukcje przygotowania przepisu
 *                       prepare_time:
 *                         type: integer
 *                         description: Czas przygotowania przepisu w minutach
 *                       dish_category_id:
 *                         type: integer
 *                         description: ID kategorii dania
 *                       diet_category_id:
 *                         type: integer
 *                         description: ID kategorii diety
 *                       calories:
 *                         type: integer
 *                         description: Liczba kalorii w przepisie
 *                       image_path:
 *                         type: string
 *                         description: Ścieżka do obrazu przepisu
 *                       num_of_portions:
 *                         type: integer
 *                         description: Liczba porcji, które można przygotować z przepisu
 *                       update_date:
 *                         type: string
 *                         format: date
 *                         description: Data ostatniej aktualizacji przepisu
 *                       author_id:
 *                         type: integer
 *                         description: ID autora przepisu
 *       401:
 *         description: Użytkownik nie jest zalogowany
 */
router.get('/recipes/search/name', authenticateToken, async (req, res) => {
    const { name } = req.query;
    try {
        const recipes = await recipesDAO.searchRecipesByName(name);
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /recipes/search/params:
 *   get:
 *     summary: Wyszukaj przepisy po parametrach
 *     description: Zwraca przepisy na podstawie podanych parametrów (dieta, kalorie, kategoria).
 *     parameters:
 *       - in: query
 *         name: diet
 *         schema:
 *           type: string
 *         description: Typ diety (np. "wegańska", "wegetariańska", "bezglutenowa")
 *       - in: query
 *         name: calories
 *         schema:
 *           type: integer
 *         description: Maksymalna liczba kalorii
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Kategoria dania (np. "breakfast", "lunch", "dinner")
 *     responses:
 *       200:
 *         description: Lista pasujących przepisów
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   recipe_id:
 *                     type: integer
 *                     description: Unikalny identyfikator przepisu
 *                   recipe_name:
 *                     type: string
 *                     description: Nazwa przepisu
 *                   ingredients:
 *                     type: string
 *                     description: Składniki przepisu
 *                   instructions:
 *                     type: string
 *                     description: Instrukcje przygotowania przepisu
 *                   prepare_time:
 *                     type: integer
 *                     description: Czas przygotowania przepisu w minutach
 *                   dish_category_id:
 *                     type: integer
 *                     description: ID kategorii dania
 *                   diet_category_id:
 *                     type: integer
 *                     description: ID kategorii diety
 *                   calories:
 *                     type: integer
 *                     description: Liczba kalorii w przepisie
 *                   image_path:
 *                     type: string
 *                     description: Ścieżka do obrazu przepisu
 *                   num_of_portions:
 *                     type: integer
 *                     description: Liczba porcji, które można przygotować z przepisu
 *                   update_date:
 *                     type: string
 *                     format: date
 *                     description: Data ostatniej aktualizacji przepisu
 *                   author_id:
 *                     type: integer
 *                     description: ID autora przepisu
 *       401:
 *         description: Użytkownik nie jest zalogowany
 */
router.get('/recipes/search/params', authenticateToken, async (req, res) => {
    const { diet, calories, category } = req.query;
    try {
        const recipes = await recipesDAO.searchRecipesByParams(diet, calories, category);
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /recipes/getDishCategories:
 *   get:
 *     summary: Pobierz wszystkie kategorie dań
 *     description: Zwraca listę wszystkich kategorii dań.
 *     responses:
 *       200:
 *         description: Lista kategorii dań
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     category: string
 *                     description: Nazwa kategorii dania (np. "śniadanie", "obiad", "kolacja")
 */
router.get('/recipes/getDishCategories', async (req, res) => {
    try {
        const categories = await categoriesDAO.getAllDishCategories();
        res.json({categories});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /recipes/getDietCategories:
 *   get:
 *     summary: Pobierz wszystkie kategorie diet
 *     description: Zwraca listę wszystkich kategorii diet.
 *     responses:
 *       200:
 *         description: Lista kategorii diet
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     category: string
 *                     description: Nazwa kategorii diety (np. "wegańska", "wegetariańska", "bezglutenowa")
 */
router.get('/recipes/getDietCategories', async (req, res) => {
    try {
        const categories = await categoriesDAO.getAllDietCategories();
        res.json({categories});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /favorites:
 *   post:
 *     summary: Dodaj przepis do ulubionych
 *     description: Dodaje przepis do ulubionych dla zalogowanego użytkownika. (musisz być zalogowany)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipe_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Przepis został dodany do ulubionych
 *       401:
 *         description: użytkownik nie jest zalogowany
 */
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

/**
 * @swagger
 * /favorites:
 *   get:
 *     summary: Pobierz ulubione przepisy użytkownika
 *     description: Zwraca listę ulubionych przepisów zalogowanego użytkownika. (musisz być zalogowany)
 *     responses:
 *       200:
 *         description: Lista ulubionych przepisów
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   recipe_id:
 *                     type: integer
 *                     description: Unikalny identyfikator przepisu
 *                   recipe_name:
 *                     type: string
 *                     description: Nazwa przepisu
 *                   ingredients:
 *                     type: string
 *                     description: Składniki przepisu
 *                   instructions:
 *                     type: string
 *                     description: Instrukcje przygotowania przepisu
 *                   prepare_time:
 *                     type: integer
 *                     description: Czas przygotowania przepisu w minutach
 *                   dish_category_id:
 *                     type: integer
 *                     description: ID kategorii dania
 *                   diet_category_id:
 *                     type: integer
 *                     description: ID kategorii diety
 *                   calories:
 *                     type: integer
 *                     description: Liczba kalorii w przepisie
 *                   image_path:
 *                     type: string
 *                     description: Ścieżka do obrazu przepisu
 *                   num_of_portions:
 *                     type: integer
 *                     description: Liczba porcji, które można przygotować z przepisu
 *                   update_date:
 *                     type: string
 *                     format: date
 *                     description: Data ostatniej aktualizacji przepisu
 *                   author_id:
 *                     type: integer
 *                     description: ID autora przepisu
 *       401:
 *         description: Użytkownik nie jest zalogowany
 */
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

/**
 * @swagger
 * /favorites:
 *   put:
 *     summary: Zmień ulubiony przepis
 *     description: Dodaje lub usuwa przepis z ulubionych w zależności od aktualnego stanu. (musisz być zalogowany)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipe_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Zaktualizowano ulubione przepisy
 *       401:
 *         description: użytkownik nie jest zalogowany
 */
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

/**
 * @swagger
 * /favorites:
 *   delete:
 *     summary: Usuń ulubiony przepis
 *     description: Usuwa przepis z ulubionych użytkownika. (musisz być zalogowany)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipe_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Przepis został usunięty z ulubionych
 *       401:
 *         description: użytkownik nie jest zalogowany
 */
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

/**
 * @swagger
 * /recipes:
 *   post:
 *     summary: Dodaj nowy wpis o przepisie do bazy danych
 *     description: Dodaje nowy rekord przepisu do bazy danych.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                recipe_id:
 *                         type: integer
 *                         description: Unikalny identyfikator przepisu
 *                recipe_name:
 *                         type: string
 *                         description: Nazwa przepisu
 *                ingredients:
 *                         type: string
 *                         description: Składniki przepisu
 *                instructions:
 *                         type: string
 *                         description: Instrukcje przygotowania przepisu
 *                prepare_time:
 *                         type: integer
 *                         description: Czas przygotowania przepisu w minutach
 *                dish_category_id:
 *                         type: integer
 *                         description: ID kategorii dania
 *                diet_category_id:
 *                         type: integer
 *                         description: ID kategorii diety
 *                calories:
 *                         type: integer
 *                         description: Liczba kalorii w przepisie
 *                image_path:
 *                         type: string
 *                         description: Ścieżka do obrazu przepisu
 *                num_of_portions:
 *                         type: integer
 *                         description: Liczba porcji, które można przygotować z przepisu
 *                update_date:
 *                         type: string
 *                         format: date
 *                         description: Data ostatniej aktualizacji przepisu
 *                author_id:
 *                         type: integer
 *                         description: ID autora przepisu  
 *     responses:
 *       200:
 *         description: Przepis został dodany
 *       401:
 *         description: użytkownik nie jest zalogowany
 */
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

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Prześlij obraz
 *     description: Przesyła obraz do serwera i zapisuje go w katalogu publicznym.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Obraz został przesłany
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imagePath:
 *                   type: string
 */
router.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.send({ imagePath: `/images/${req.file.filename}` });
});

/**
 * @swagger
 * /recipes/{id}:
 *   put:
 *     summary: Aktualizuj przepis
 *     description: Aktualizuje istniejący przepis w bazie danych. (musisz być zalogowany)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID przepisu do zaktualizowania
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipe_id:
 *                         type: integer
 *                         description: Unikalny identyfikator przepisu
 *               recipe_name:
 *                         type: string
 *                         description: Nazwa przepisu
 *               ingredients:
 *                         type: string
 *                         description: Składniki przepisu
 *               instructions:
 *                         type: string
 *                         description: Instrukcje przygotowania przepisu
 *               prepare_time:
 *                         type: integer
 *                         description: Czas przygotowania przepisu w minutach
 *               dish_category_id:
 *                         type: integer
 *                         description: ID kategorii dania
 *               diet_category_id:
 *                         type: integer
 *                         description: ID kategorii diety
 *               calories:
 *                         type: integer
 *                         description: Liczba kalorii w przepisie
 *               image_path:
 *                         type: string
 *                         description: Ścieżka do obrazu przepisu
 *               num_of_portions:
 *                         type: integer
 *                         description: Liczba porcji, które można przygotować z przepisu
 *               update_date:
 *                         type: string
 *                         format: date
 *                         description: Data ostatniej aktualizacji przepisu
 *               author_id:
 *                         type: integer
 *                         description: ID autora przepisu  
 *     responses:
 *       200:
 *         description: Przepis został zaktualizowany
 *       401:
 *          description: użytkownik nie jest zalogowany
 */
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

/**
 * @swagger
 * /recipes/{id}:
 *   delete:
 *     summary: Usuń przepis
 *     description: Usuwa przepis z bazy danych. (musisz być zalogowany)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID przepisu do usunięcia
 *     responses:
 *       200:
 *         description: Przepis został usunięty
 *       401:
 *         description: użytkownik nie jest zalogowany
 */     
router.delete('/recipes/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const deletedRecipe = await recipesDAO.deleteRecipe(id);
        res.json(deletedRecipe);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Wyszukaj użytkownika po email
 *     description: Zwraca dane użytkownika na podstawie podanego adresu email.
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Adres email użytkownika
 *     responses:
 *       200:
 *         description: Dane użytkownika
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: integer
 *                   description: Unikalny identyfikator użytkownika
 *                 email:
 *                   type: string
 *                   description: Adres email użytkownika
 *                 password:
 *                   type: string
 *                   description: Hasło użytkownika (zaszyfrowane)
 *                 permission:
 *                   type: string
 *                   enum: [user, admin]
 *                   description: Uprawnienia użytkownika
 *                 block:
 *                   type: string
 *                   enum: [blocked, active]
 *                   description: Status użytkownika (zablokowany lub aktywny)
 *       403:
 *         description: Brak dostępu (użytkownik nie jest administratorem)
 *     examples:
 *       application/json:
 *         {
 *           "user_id": 1,
 *           "email": "example@example.com",
 *           "password": "$2b$10$hashedpassword",
 *           "permission": "user",
 *           "block": "active"
 *         }
 */
router.get('/users/search', authenticateToken, checkAdmin, async (req, res) => {
    const { email } = req.query;
    try {
        const user = await userDAO.getUserByEmail(email);
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Pobierz wszystkich użytkowników
 *     description: Zwraca listę wszystkich użytkowników w systemie.
 *     responses:
 *       200:
 *         description: Lista użytkowników
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user_id:
 *                     type: integer
 *                     description: Unikalny identyfikator użytkownika
 *                   email:
 *                     type: string
 *                     description: Adres email użytkownika
 *                   password:
 *                     type: string
 *                     description: Hasło użytkownika (zaszyfrowane)
 *                   permission:
 *                     type: string
 *                     enum: [user, admin]
 *                     description: Uprawnienia użytkownika
 *                   block:
 *                     type: string
 *                     enum: [blocked, active]
 *                     description: Status użytkownika (zablokowany lub aktywny)
 *         examples:
 *           application/json:
 *             value:
 *               - user_id: 1
 *                 email: "example1@example.com"
 *                 password: "$2b$10$hashedpassword1"
 *                 permission: "user"
 *                 block: "active"
 *               - user_id: 2
 *                 email: "example2@example.com"
 *                 password: "$2b$10$hashedpassword2"
 *                 permission: "admin"
 *                 block: "blocked"
 *       403:
 *         description: Brak dostępu (użytkownik nie jest administratorem)
 */
router.get('/users', authenticateToken, checkAdmin, async (req, res) => {
    try {
        const users = await userDAO.getAllUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /users/{userId}/block:
 *   put:
 *     summary: Zablokuj użytkownika
 *     description: Blokuje użytkownika na podstawie jego ID.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID użytkownika do zablokowania
 *     responses:
 *       200:
 *         description: Użytkownik został zablokowany
 *       403:
 *         description: Brak dostępu (użytkownik nie jest administratorem)    
 */
router.put('/users/:userId/block', authenticateToken, checkAdmin, async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await userDAO.blockUser(userId);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /users/{userId}/unblock:
 *   put:
 *     summary: Odblokuj użytkownika
 *     description: Odblokowuje użytkownika na podstawie jego ID.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID użytkownika do odblokowania
 *     responses:
 *       200:
 *         description: Użytkownik został odblokowany
 *       403:
 *         description: Brak dostępu (użytkownik nie jest administratorem)
 */
router.put('/users/:userId/unblock', authenticateToken, checkAdmin, async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await userDAO.unblockUser(userId);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /users/{userId}/permissions:
 *   put:
 *     summary: Zmień uprawnienia użytkownika
 *     description: Aktualizuje uprawnienia użytkownika (np. z "user" na "admin").
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID użytkownika
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permission:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       200:
 *         description: Uprawnienia użytkownika zostały zaktualizowane
 *       403:
 *         description: Brak dostępu (użytkownik nie jest administratorem)
 */
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

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Zarejestruj nowego użytkownika
 *     description: Tworzy nowego użytkownika w systemie.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Użytkownik został zarejestrowany
 */
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await authDAO.register(email, password);
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Zaloguj użytkownika
 *     description: Loguje użytkownika i zwraca token autoryzacyjny.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Zalogowano pomyślnie
 */
router.post('/login', async (req, res) => {
    const { email, password} = req.body;
    try {
        const token = await authDAO.login(email, password);
        res.json(token);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Zresetuj hasło użytkownika
 *     description: Resetuje hasło użytkownika na podstawie podanych danych.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Hasło zostało zresetowane
 */
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