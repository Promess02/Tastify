import React, { useState, useEffect } from 'react';
import Recipe from './DTO/Recipe.tsx';
import axios from 'axios';
import Login from './components/LoginForm.js'; 
import jwt from 'jsonwebtoken';
import './App.css';

const Recipes = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState({ email: '', permission: '' });

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const response = await axios.get('http://localhost:4000/recipes', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setRecipes(response.data.recipes);
                    setIsLoggedIn(true);
                    const userInfo = jwt.decode(token);
                    setUser({ email: userInfo.email, permission: userInfo.permission });
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchRecipes();
    }, []);

    const handleLoginSuccess = (token) => {
        const userInfo = jwt.decode(token);
        setUser({ email: userInfo.email, permission: userInfo.permission });
        setIsLoggedIn(true);
        fetchRecipes();
    };

    const fetchRecipes = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await axios.get('http://localhost:4000/recipes', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRecipes(response.data.recipes);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setUser({ email: '', permission: '' });
        setRecipes([]);
    };

    return (
        <div className = "app-container">
           {!isLoggedIn ? (
            <div className='login-container'>
                 <Login onLoginSuccess={handleLoginSuccess} />
            </div>
            ) : (
                <div>
                <div>
                    <div className='user-info'>
                        <p>Email: {user.email}</p>
                        <p>Permission: {user.permission}</p>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                </div>
                <h1>Recipes</h1>
                <ul className='recipe-list'>
                    {recipes.map((recipe) => (
                        <li key={recipe.recipe_id} className='recipe-item'>
                            <h2>{recipe.recipe_name}</h2>
                            <p>{recipe.ingredients}</p>
                            <p>{recipe.instructions}</p>
                            <p>Preparation Time: {recipe.prepare_time} minutes</p>
                            <p>Calories: {recipe.calories}</p>
                        </li>
                    ))}
                </ul>
            </div>
            )}
        </div>
    );
};

export default Recipes;