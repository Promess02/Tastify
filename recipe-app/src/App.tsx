import React, { useState, useEffect } from 'react';
import Recipe from './DTO/Recipe.tsx';
import axios from 'axios';
import PaginatedRecipes from './components/PaginatedRecipes.tsx';
import Login from './components/LoginForm.js'; 
import TopBar from './components/TopBar.tsx';
import jwt from 'jsonwebtoken';
import FilterDrawer from './components/FilterDrawer.tsx';
import ResetPassword from './components/ResetPassword.tsx';
import './App.css';

const App: React.FC = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState({ email: '', permission: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [showResetPassword, setShowResetPassword] = useState(false);

    useEffect(() => {
        const fetchRecipes = async () => {
            const response = await axios.get('http://localhost:4000/recipes');
            setRecipes(response.data.recipes);
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    setIsLoggedIn(true);
                    const userInfo = jwt.decode(token);
                    setUser({ email: userInfo.email, permission: userInfo.permission });
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchRecipes();
    }, []);

    useEffect(() => {
        if (isDrawerOpen) {
            const timer = setTimeout(() => {
                document.addEventListener('click', handleClickOutside);
            }, 0);
            return () => {
                clearTimeout(timer);
                document.removeEventListener('click', handleClickOutside);
            };
        } else {
            document.removeEventListener('click', handleClickOutside);
        }
    }, [isDrawerOpen]);

    const handleLoginSuccess = (token) => {
        const userInfo = jwt.decode(token);
        setUser({ email: userInfo.email, permission: userInfo.permission });
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setUser({ email: '', permission: '' });
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleFilterChange = (newFilters: any) => {
        setFilters(newFilters);
    };

    const toggleDrawer = () => {
        setIsDrawerOpen(true);
    };

    const handleClickOutside = (event: MouseEvent) => {
        const drawer = document.querySelector('.filter-drawer');
        if (drawer && !drawer.contains(event.target as Node)) {
            setIsDrawerOpen(false);
        }
    };

    const handleResetPassword = () => {
        setShowResetPassword(true);
    };

    const handleClose = () => {
        setShowResetPassword(false);
    };

    return (
        <div>
            <div className='title-banner'>
                <h1>Tastify</h1>
            </div>
            <div className='app-container'>
                {!isLoggedIn && <Login onLoginSuccess={handleLoginSuccess} />}
                {showResetPassword && <ResetPassword user={user} onClose={handleClose} />}
                <TopBar
                    user={user}
                    isLoggedIn={isLoggedIn}
                    searchTerm={searchTerm}
                    handleSearch={handleSearch}
                    handleLogout={handleLogout}
                    handleLoginSuccess={handleLoginSuccess}
                    resetPassword={handleResetPassword}
                    toggleDrawer={toggleDrawer}
                />
                <div>
                    {isDrawerOpen && <FilterDrawer onFilterChange={handleFilterChange} isLoggedIn={isLoggedIn}/> }
                    <PaginatedRecipes recipes={recipes} searchTerm={searchTerm} filters={filters} isLoggedin={isLoggedIn}/>
                </div>
            </div>
        </div>
    );
};

export default App;