import React, { useState } from 'react';
import Recipe from '../DTO/Recipe';
import '../App.css';

interface EditRecipeProps {
    recipe: Recipe;
    dishCategories: { id: number, name: string }[];
    dietCategories: { id: number, name: string }[];
    onSave: (updatedRecipe: Recipe) => void;
    onCancel: () => void;
}

const EditRecipe: React.FC<EditRecipeProps> = ({ recipe, dishCategories, dietCategories, onSave, onCancel }) => {
    const [updatedRecipe, setUpdatedRecipe] = useState<Recipe>({ ...recipe });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUpdatedRecipe(prevRecipe => ({
            ...prevRecipe,
            [name]: name === 'prepare_time' || name === 'calories' || name === 'num_of_portions' ? Number(value) : value
        }));
    };

    const handleSave = () => {
        if (!updatedRecipe.recipe_name || !updatedRecipe.ingredients || !updatedRecipe.instructions) {
            alert('Please fill out all necessary values before saving');
            return;
        }
        onSave(updatedRecipe);
    };

    return (
        <div className="edit-recipe-modal">
            <h2>Edit Recipe</h2>
            <div className="form-group">
                <label>Name:</label>
                <input
                    type="text"
                    name="recipe_name"
                    value={updatedRecipe.recipe_name}
                    onChange={handleChange}
                />
            </div>
            <div className="form-group">
                <label>Ingredients:</label>
                <textarea
                    name="ingredients"
                    value={updatedRecipe.ingredients}
                    onChange={handleChange}
                />
            </div>
            <div className="form-group">
                <label>Instructions:</label>
                <textarea
                    name="instructions"
                    value={updatedRecipe.instructions}
                    onChange={handleChange}
                />
            </div>
            <div className="form-group">
                <label>Prepare Time (10 mins to 180 mins):</label>
                <input
                    type="number"
                    name="prepare_time"
                    value={updatedRecipe.prepare_time}
                    onChange={handleChange}
                    min="10"
                    max="180"
                />
            </div>
            <div className="form-group">
                <label>Dish Category:</label>
                <select
                    name="dish_category_id"
                    value={updatedRecipe.dish_category_id}
                    onChange={handleChange}
                >
                    {dishCategories.map(category => (
                        <option key={category.id} value={Number(category.id)}>{category.name}</option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label>Diet Category:</label>
                <select
                    name="diet_category_id"
                    value={updatedRecipe.diet_category_id}
                    onChange={handleChange}
                >
                    {dietCategories.map(category => (
                        <option key={category.id} value={Number(category.id)}>{category.name}</option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label>Calories:</label>
                <input
                    type="number"
                    name="calories"
                    value={updatedRecipe.calories}
                    onChange={handleChange}
                />
            </div>
            <div className="form-group">
                <label>Number of Portions (1 to 12):</label>
                <input
                    type="number"
                    name="num_of_portions"
                    value={updatedRecipe.num_of_portions}
                    onChange={handleChange}
                    min="1"
                    max="12"
                />
            </div>
            <div className="form-actions">
                <button onClick={handleSave}>Confirm</button>
                <button onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
};

export default EditRecipe;