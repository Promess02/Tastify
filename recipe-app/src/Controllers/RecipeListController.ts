import axios from 'axios';
import Recipe from '../DTO/Recipe';

const RecipesListController = {
    async fetchRecipes(): Promise<Recipe[]> {
        try {
            const response = await axios.get('http://localhost:4000/recipes');
            return response.data.recipes;
        } catch (error) {
            console.error('Error fetching recipes:', error);
            throw error;
        }
    },

    async createRecipe(newRecipe: Recipe): Promise<Recipe> {
        try {
            const response = await axios.post('http://localhost:4000/recipes', newRecipe, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error creating recipe:', error);
            throw error;
        }
    },

    async updateRecipe(updatedRecipe: Recipe): Promise<Recipe> {
        try {
            const response = await axios.put(`http://localhost:4000/recipes/${updatedRecipe.recipe_id}`, updatedRecipe, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error updating recipe:', error);
            throw error;
        }
    },

    async deleteRecipe(recipeId: number): Promise<void> {
        try {
            await axios.delete(`http://localhost:4000/recipes/${recipeId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
        } catch (error) {
            console.error('Error deleting recipe:', error);
            throw error;
        }
    },
};

export default RecipesListController;