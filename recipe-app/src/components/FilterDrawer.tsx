import React, { useState, useEffect } from 'react';
import '../App.css';
import axios from 'axios';

interface Category {
    category_id: number;
    category_name: string;
    category_type: 'dish' | 'diet';
    category_description: string;
}

interface FilterDrawerProps {
    onFilterChange: (filters: any) => void;
    isLoggedIn: boolean;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({ onFilterChange, isLoggedIn }) => {
    const [prepareTime, setPrepareTime] = useState(180);
    const [dishCategory, setDishCategory] = useState('ALL');
    const [dietCategory, setDietCategory] = useState('ALL');
    const [calories, setCalories] = useState('');
    const [numOfPortions, setNumOfPortions] = useState(10);
    const [dishCategories, setDishCategories] = useState<Category[]>([]);
    const [dietCategories, setDietCategories] = useState<Category[]>([]);
    const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

    useEffect(() => {
        const fetchDishCategories = async () => {
            try {
                const response = await axios.get('http://localhost:4000/recipes/getDishCategories');
                setDishCategories(response.data.categories);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        const fetchDietCategories = async () => {
            try {
                const response = await axios.get('http://localhost:4000/recipes/getDietCategories');
                setDietCategories(response.data.categories);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchDishCategories();
        fetchDietCategories();
    }, []);

    const handleFilterChange = () => {
        onFilterChange({
            prepareTime,
            dishCategory,
            dietCategory,
            calories,
            numOfPortions,
            showOnlyFavorites
        });
    };

    const handleToggleChange = () => {
        setShowOnlyFavorites(!showOnlyFavorites);
    };

    return (
        <div className="filter-drawer">
            <h2>Filter Recipes</h2>
            <div className="filter-group">
                <label>Preparation Time (minutes):</label>
                <input
                    type="range"
                    min="1"
                    max="180"
                    value={prepareTime}
                    onChange={(e) => setPrepareTime(Number(e.target.value))}
                />
                <span>{prepareTime} minutes</span>
            </div>
            <div className="filter-group">
                <label>Dish Category:</label>
                <select value={dishCategory} onChange={(e) => setDishCategory(e.target.value)}>
                    <option value="ALL">All</option>
                    {dishCategories.map((category) => (
                        <option key={category.category_id} value={category.category_id}>
                            {category.category_name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="filter-group">
                <label>Diet Category:</label>
                <select value={dietCategory} onChange={(e) => setDietCategory(e.target.value)  }>
                    <option value="ALL">All</option>
                    {dietCategories.map((category) => (
                        <option key={category.category_id} value={category.category_id}>
                            {category.category_name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="filter-group">
                <label>Calories:</label>
                <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                />
            </div>
            <div className="filter-group">
                <label>Number of Portions:</label>
                <input
                    type="range"
                    min="1"
                    max="10"
                    value={numOfPortions}
                    onChange={(e) => setNumOfPortions(Number(e.target.value))}
                />
                <span>{numOfPortions}</span>
            </div>
            {isLoggedIn && <div className="filter-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={showOnlyFavorites}
                            onChange={handleToggleChange}
                        />
                        Show only favorite recipes
                    </label>
                </div>}
            <button onClick={handleFilterChange} className='filter-button'>Apply Filters</button>
        </div>
    );
};

export default FilterDrawer;