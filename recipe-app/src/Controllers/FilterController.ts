import axios from 'axios';

export const fetchDishCategories = async () => {
    try {
        const response = await axios.get('http://localhost:4000/recipes/getDishCategories');
        return response.data.categories;
    } catch (error) {
        console.error('Error fetching dish categories:', error);
        throw error;
    }
};

export const fetchDietCategories = async () => {
    try {
        const response = await axios.get('http://localhost:4000/recipes/getDietCategories');
        return response.data.categories;
    } catch (error) {
        console.error('Error fetching diet categories:', error);
        throw error;
    }
};