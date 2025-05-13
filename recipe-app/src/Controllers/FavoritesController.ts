import axios from 'axios';

export const postNewFavorite = async (recipeId: number): Promise<void> => {
    try {
        await axios.post('http://localhost:4000/favorites', 
            { recipe_id: recipeId },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
    } catch (error) {
        console.error('Error adding favorite:', error);
        throw error;
    }
};

export const deleteFavorite = async (recipeId: number): Promise<void> => {
    try {
        await axios.delete('http://localhost:4000/favorites', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            data: { recipe_id: recipeId }
        });
    } catch (error) {
        console.error('Error deleting favorite:', error);
        throw error;
    }
};

export const fetchLikedRecipes = async (): Promise<number[]> => {
    try {
        const response = await axios.get('http://localhost:4000/favorites', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (response.status === 200) {
            const data = response.data;
            return data.map((favorite: { recipe_id: number }) => favorite.recipe_id);
        }
        return [];
    } catch (error) {
        console.error('Error fetching favorites:', error);
        throw error;
    }
};