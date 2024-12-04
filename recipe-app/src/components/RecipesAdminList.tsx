import React, {useState} from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Recipe from '../DTO/Recipe';
import EditRecipe from './EditRecipe.tsx';
import axios from 'axios';

interface RecipesAdminListProps {
    recipes: Recipe[];
    user_id: number;
    onUpdateRecipes: (recipes: Recipe[]) => void;
}

const RecipesAdminList: React.FC<RecipesAdminListProps> = ({ recipes: initialRecipes, user_id, onUpdateRecipes}) => {
    const categories = ['', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Vegan', 'Vegetarian', 'Keto', 'Paleo', 'Gluten-Free'];
    const dishCategories = [
        { id: 1, name: 'Breakfast' },
        { id: 2, name: 'Lunch' },
        { id: 3, name: 'Dinner' },
        { id: 4, name: 'Snack' },
        { id: 5, name: 'Dessert' }
    ];
    const dietCategories = [
        { id: 6, name: 'Vegan' },
        { id: 7, name: 'Vegetarian' },
        { id: 8, name: 'Keto' },
        { id: 9, name: 'Paleo' },
        { id: 10, name: 'Gluten-Free' }
    ];
    const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
    const [isNewRecipe, setIsNewRecipe] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const recipesPerPage = 12;

    const indexOfLastRecipe = currentPage * recipesPerPage;
    const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
    const filteredRecipes = recipes.filter(recipe => recipe.recipe_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const currentRecipes = filteredRecipes.slice(indexOfFirstRecipe, indexOfLastRecipe);

    const totalPages = Math.ceil(recipes.length / recipesPerPage);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handleDeleteRecipe = (recipeId: number) => {
        if (window.confirm('Are you sure you want to delete this recipe?')) {
            try{
                axios.delete(`http://localhost:4000/recipes/${recipeId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setRecipes(prevRecipes => {
                    const updatedRecipes = prevRecipes.filter(recipe => recipe.recipe_id !== recipeId);
                    onUpdateRecipes(updatedRecipes);
                    return updatedRecipes;
                });
            } catch (err) {
                console.error('Error deleting recipe:', err);
            }
        }
    };

    const handleEditRecipe = (recipe: Recipe) => {
        setEditingRecipe(recipe);
        setIsNewRecipe(false);
    };

    const handleSaveRecipe = async (updatedRecipe: Recipe) => {
        updatedRecipe.update_date = new Date().toISOString().split('T')[0];
        updatedRecipe.dish_category_id = Number(updatedRecipe.dish_category_id);
        updatedRecipe.diet_category_id = Number(updatedRecipe.diet_category_id);
        try {
            await axios.put(`http://localhost:4000/recipes/${updatedRecipe.recipe_id}`, updatedRecipe, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setRecipes(prevRecipes => {
                const updatedRecipes = prevRecipes.map(recipe =>
                    recipe.recipe_id === updatedRecipe.recipe_id ? updatedRecipe : recipe
                );
                onUpdateRecipes(updatedRecipes);
                return updatedRecipes;
            });
            setEditingRecipe(null);
        } catch (err) {
            console.error('Error updating recipe:', err);
        }
    };

    const handleNewRecipe = async (newRecipe: Recipe) => {
        newRecipe.update_date = new Date().toISOString().split('T')[0];
        newRecipe.author_id = user_id;
        newRecipe.dish_category_id = Number(newRecipe.dish_category_id);
        newRecipe.diet_category_id = Number(newRecipe.diet_category_id);
        try {
            await axios.post('http://localhost:4000/recipes', newRecipe, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setRecipes(prevRecipes => {
                const updatedRecipes = [...prevRecipes, newRecipe];
                onUpdateRecipes(updatedRecipes);
                return updatedRecipes;
            });
            setEditingRecipe(null);
            setIsNewRecipe(false);
        } catch (err) {
            console.error('Error creating new recipe:', err);
        }
    };

    const handleNewRecipeClick = () => {
        setEditingRecipe({
            recipe_id: 0,
            recipe_name: '',
            ingredients: '',
            instructions: '',
            prepare_time: 10,
            dish_category_id: 1,
            diet_category_id: 6,
            calories: 0,
            image_path: '/images/gnocci.jpg',
            num_of_portions: 1,
            update_date: '',
            author_id: user_id
        });
        setIsNewRecipe(true);
    };

    const handleCancelEdit = () => {
        setEditingRecipe(null);
    };

    return (
        <div className="recipe-admin-list">
            <h2>Recipes</h2>
            <div className='search-container'>
                <input
                    type="text"
                    placeholder="Search recipes by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-bar"
                />
                <button className="new-recipe-button" onClick={handleNewRecipeClick}>New Recipe</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Dish Category</th>
                        <th>Diet Category</th>
                        <th>Update Date</th>
                    </tr>
                </thead>
                <tbody>
                    {currentRecipes.map(recipe => (
                        <tr key={recipe.recipe_id}>
                            <td>{recipe.recipe_name}</td>
                            <td>{categories[recipe.dish_category_id]}</td>
                            <td>{categories[recipe.diet_category_id]}</td>
                            <td>{recipe.update_date}</td>
                            <td>
                                <FaEdit size={21} className="action-icon" onClick={() => handleEditRecipe(recipe)} />
                                <FaTrash size={21} className="action-icon" onClick={() => handleDeleteRecipe(recipe.recipe_id)} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="pagination">
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => handlePageChange(index + 1)}
                        className={currentPage === index + 1 ? 'active' : ''}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
            {editingRecipe && (
                <EditRecipe
                    recipe={editingRecipe}
                    dishCategories={dishCategories}
                    dietCategories={dietCategories}
                    onSave={isNewRecipe ? handleNewRecipe : handleSaveRecipe}
                    onCancel={handleCancelEdit}
                />
            )}
        </div>
    );
}

export default RecipesAdminList;