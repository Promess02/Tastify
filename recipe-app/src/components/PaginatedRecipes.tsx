import React, { useState, useEffect} from 'react';
import { FaHeart } from 'react-icons/fa';
import RecipeDetails from './RecipeDetails.tsx';
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

interface PaginatedRecipesProps {
    recipes: Recipe[];
    searchTerm: string;
    filters: any;
    isLoggedin: boolean;
}

const PaginatedRecipes: React.FC<PaginatedRecipesProps> = ({ recipes, searchTerm, filters, isLoggedin }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const recipesPerPage = 5;
    const [likedRecipes, setLikedRecipes] = useState<number[]>([]);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const dishCategories = ['', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Vegan', 'Vegetarian', 'Keto', 'Paleo', 'Gluten-Free'];

    const postNewFavorite = async (recipeId: number) => {
        try {
            const response = await fetch('http://localhost:4000/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ recipe_id: recipeId })
            });
            if (response.ok) {
                setLikedRecipes(prevLikedRecipes => [...prevLikedRecipes, recipeId]);
            }
        } catch (error) {
            console.error('Error adding favorite:', error);
        }
    };

    const fetchLikedRecipes = async () => {
        try {
            const response = await fetch('http://localhost:4000/favorites', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setLikedRecipes(data.favorites.map((favorite: { recipe_id: number }) => favorite.recipe_id));
            }
        } catch (error) {
            console.error('Error fetching favorites:', error);
        }
    };

    useEffect(() => {
        fetchLikedRecipes();
    }, []);

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

    const handleLike = (recipeId: number) => {
        setLikedRecipes(prevLikedRecipes =>
            prevLikedRecipes.includes(recipeId)
                ? prevLikedRecipes.filter(id => id !== recipeId)
                : [...prevLikedRecipes, recipeId]
        );
        postNewFavorite(recipeId);
    };

    const handleRecipeClick = (recipe: Recipe) => {
        setSelectedRecipe(recipe);
    };

    const handleCloseDetails = () => {
        setSelectedRecipe(null);
    };

    const indexOfLastRecipe = currentPage * recipesPerPage;
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
                                {isLoggedin && <FaHeart size={30}
                                    className={`heart-icon ${likedRecipes.includes(recipe.recipe_id) ? 'liked' : ''}`}
                                    onClick={(e) =>{
                                        e.stopPropagation();
                                        handleLike(recipe.recipe_id);
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