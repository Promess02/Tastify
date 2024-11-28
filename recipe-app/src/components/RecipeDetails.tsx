import React from 'react';
import '../App.css';

interface Recipe {
    recipe_id: number;
    recipe_name: string;
    ingredients: string;
    instructions: string;
    prepare_time: number;
    dish_category_id: number;
    diet_category_id: number;
    calories: number;
    image_path: string;
    num_of_portions: number;
    update_date: string;
    author_id: number;
}

interface RecipeDetailsProps {
    recipe: Recipe;
    onClose: () => void;
}

const RecipeDetails: React.FC<RecipeDetailsProps> = ({ recipe, onClose }) => {
    return (
        <div className="recipe-details-overlay">
            <div className="recipe-details">
                <button className="close-button" onClick={onClose}>X</button>
                <h2>{recipe.recipe_name}</h2>
                <img src={recipe.image_path || '/images/gnocci.jpg'} alt={recipe.recipe_name} className='recipe-image-details' />
                <p><strong>Ingredients:</strong> {recipe.ingredients}</p>
                <p><strong>Instructions:</strong> {recipe.instructions}</p>
                <p><strong>Preparation Time:</strong> {recipe.prepare_time} minutes</p>
                <p><strong>Number of Portions:</strong> {recipe.num_of_portions}</p>
                <p><strong>Calories:</strong> {recipe.calories}</p>
            </div>
        </div>
    );
};

export default RecipeDetails;