import React, { useState, useEffect} from 'react';
import { FaHeart } from 'react-icons/fa';
import RecipeDetails from './RecipeDetails.tsx';
import '../App.css';
import { postNewFavorite, deleteFavorite, fetchLikedRecipes } from '../Controllers/FavoritesController.ts';


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

interface PaginatedRecipesProps {
    user_id: string;
    recipes: Recipe[];
    searchTerm: string;
    filters: any;
    isLoggedin: boolean;
}

const PaginatedRecipes: React.FC<PaginatedRecipesProps> = ({ user_id, recipes, searchTerm, filters, isLoggedin }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const recipesPerPage = 5;
    const [likedRecipes, setLikedRecipes] = useState<number[]>([]);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const dishCategories = ['', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Vegan', 'Vegetarian', 'Keto', 'Paleo', 'Gluten-Free'];

    const handleLike = async (recipeId: number) => {
        try {
            await postNewFavorite(recipeId);
            setLikedRecipes(prevLikedRecipes => [...prevLikedRecipes, recipeId]);
        } catch (error) {
            console.error('Error liking recipe:', error);
        }
    };

    const handleDislike = async (recipeId: number) => {
        try {
            await deleteFavorite(recipeId);
            setLikedRecipes(prevLikedRecipes => prevLikedRecipes.filter(id => id !== recipeId));
        } catch (error) {
            console.error('Error disliking recipe:', error);
        }
    };

    useEffect(() => {
        if (isLoggedin) {
            fetchLikedRecipes()
                .then((likedRecipes) => setLikedRecipes(likedRecipes))
                .catch((error) => console.error('Error fetching liked recipes:', error));
        }
    }, [isLoggedin]);

    const isFiltersEmpty = (filters) => {
        return Object.keys(filters).length === 0;
    };
    
    const getFilteredRecipes = (recipes, filters, searchTerm) => {
        if (isFiltersEmpty(filters)) {
            return recipes;
        }
        return recipes.filter(recipe => {
            return (
                recipe.recipe_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                recipe.prepare_time <= (filters.prepareTime || 180) &&
                (filters.dishCategory === 'ALL' || Number(filters.dishCategory) === recipe.dish_category_id) &&
                (filters.dietCategory === 'ALL' || Number(filters.dietCategory) === recipe.diet_category_id) &&
                (filters.calories ? recipe.calories <= Number(filters.calories) : true) &&
                (filters.showOnlyFavorites ? likedRecipes.includes(recipe.recipe_id) : true) &&
                recipe.num_of_portions <= (filters.numOfPortions || 10)
            );
        });
    };

    const filteredRecipes = getFilteredRecipes(recipes, filters, searchTerm);

    const handleRecipeClick = (recipe: Recipe) => {
        setSelectedRecipe(recipe);
    };

    const handleCloseDetails = () => {
        setSelectedRecipe(null);
    };

     const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);
     const validCurrentPage = Math.min(currentPage, totalPages);
 
    const indexOfLastRecipe = validCurrentPage * recipesPerPage;
    const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
    const currentRecipes = filteredRecipes.slice(indexOfFirstRecipe, indexOfLastRecipe);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    return (
        <div className='paginated-list'>
            {filteredRecipes.length === 0 ? (
                <p>No recipes were found</p>
            ) : (
                <>
                    <ul className='recipe-list'>
                        {currentRecipes.map((recipe) => (
                            <li key={recipe.recipe_id} className='recipe-item' tabIndex={0} onClick={() => handleRecipeClick(recipe)}>
                                 <div className='recipe-content'>
                                    <h2>{recipe.recipe_name}</h2>
                                    <p>{recipe.ingredients}</p>
                                    <p>Preparation Time: <span>{recipe.prepare_time} minutes</span></p>
                                    <p>Number of portions: <span>{recipe.num_of_portions}</span></p>
                                    <p>Dish Category: <span>{dishCategories[recipe.dish_category_id]}</span></p>
                                    <p>Diet Category: <span>{dishCategories[recipe.diet_category_id]}</span></p>
                                    <p>Calories: <span>{recipe.calories}</span></p>
                                </div>
                                <img src={ String(recipe.image_path).at(0)==='/' ? recipe.image_path : '/' + recipe.image_path } alt={recipe.recipe_name} className='recipe-image' 
                                onError={(e) => { e.currentTarget.src = '/images/gnocci.jpg'; }}/>
                                {isLoggedin && <FaHeart size={40}
                                    className={`heart-icon ${likedRecipes.includes(recipe.recipe_id) ? 'liked' : ''}`}
                                    onClick={(e) =>{
                                        e.stopPropagation();
                                        if (likedRecipes.includes(recipe.recipe_id)) {
                                            handleDislike(recipe.recipe_id);
                                        } else {
                                            handleLike(recipe.recipe_id);
                                        }
                                    } }
                                />
                                }
                            </li>
                        ))}
                    </ul>
                    <div className='pagination'>
                        {Array.from({ length: Math.ceil(filteredRecipes.length / recipesPerPage) }, (_, i) => (
                            <button key={i + 1} onClick={() => paginate(i + 1)}>
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </>
            )}
        {selectedRecipe && <RecipeDetails recipe={selectedRecipe} onClose={handleCloseDetails} />}
        </div>
    );
};

export default PaginatedRecipes;