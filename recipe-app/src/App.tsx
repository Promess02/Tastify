import React, { useState, useEffect } from 'react';
import Category from './DTO/Category.tsx';
import FavoriteRecipe from './DTO/FavoriteRecipe.tsx';
import LoginHistory from './DTO/LoginHistory.tsx';
import Recipe from './DTO/Recipe.tsx';

const Recipes = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const response = await fetch('http://localhost:4000/recipes');
                const data = await response.json();
                setRecipes(data.recipes);
            } catch (error) {
                console.error('Error fetching recipes:', error);
            }
        };

        fetchRecipes();
    }, []);

    return (
        <div>
            <h1>Recipes</h1>
            <ul>
            {recipes.map((recipe) => (
                    <li key={recipe.recipe_id}>
                        <h2>{recipe.recipe_name}</h2>
                        <p>{recipe.ingredients}</p>
                        <p>{recipe.instructions}</p>
                        <p>Preparation Time: {recipe.prepare_time} minutes</p>
                        <p>Calories: {recipe.calories}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Recipes;