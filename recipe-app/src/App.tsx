import React, { useState, useEffect } from 'react';
import Recipe from './DTO/Recipe.tsx';
import axios from 'axios';
import PaginatedRecipes from './components/PaginatedRecipes.tsx';
import Login from './components/LoginForm.js'; 
import TopBar from './components/TopBar.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import jwt from 'jsonwebtoken';
import FilterDrawer from './components/FilterDrawer.tsx';
import ResetPassword from './components/ResetPassword.tsx';
import { jwtDecode } from 'jwt-decode';
import './App.css';

const App: React.FC = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState({user_id: '', email: '', permission: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);   
    const [showResetPassword, setShowResetPassword] = useState(false);

    useEffect(() => {
        const fetchRecipes = async () => {
            const response = await axios.get('http://localhost:4000/recipes');
            setRecipes(response.data.recipes);
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const decodedToken = jwtDecode<{exp: number}>(token);
                    const currentTime = Date.now() / 1000;
                    
                    // check if token is expired
                    if (decodedToken.exp < currentTime) {
                        localStorage.removeItem('token');
                        setIsLoggedIn(false);
                        setUser({user_id: '', email: '', permission: '' });
                    } else {
                        setIsLoggedIn(true);
                        const userInfo = jwt.decode(token);
                        setUser({ user_id: userInfo.user_id, email: userInfo.email, permission: userInfo.permission });
                    }
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
        setUser({ user_id: userInfo.user_id, email: userInfo.email, permission: userInfo.permission });
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setUser({user_id: '', email: '', permission: '' });
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

    const openAdminPanel = () => {
        setIsAdminPanelOpen(true);
    };

    const closeAdminPanel = () => {
        setIsAdminPanelOpen(false);
    };

    const handleUpdateRecipes = (updatedRecipes: Recipe[]) => {
        setRecipes(updatedRecipes);
    }

    return (
        <div>
            <div className='title-banner'>
                <h1>Tastify</h1>
            </div>
            <div className='app-container'>
                {!isLoggedIn && <Login onLoginSuccess={handleLoginSuccess} />}
                {showResetPassword && <ResetPassword user_id={user.user_id} onClose={handleClose} />}
                <TopBar
                    user={user}
                    isLoggedIn={isLoggedIn}
                    searchTerm={searchTerm}
                    handleSearch={handleSearch}
                    handleLogout={handleLogout}
                    handleLoginSuccess={handleLoginSuccess}
                    resetPassword={handleResetPassword}
                    toggleDrawer={toggleDrawer}
                    openAdminPanel={openAdminPanel}
                />
                <div>
                    <FilterDrawer isDrawerOpen={isDrawerOpen} onFilterChange={handleFilterChange} isLoggedIn={isLoggedIn}/>
                    <PaginatedRecipes user_id={user.user_id} recipes={recipes} searchTerm={searchTerm} filters={filters} isLoggedin={isLoggedIn}/>
                    <AdminPanel isAdminPanelOpen={isAdminPanelOpen} onClose={closeAdminPanel} recipes={recipes} user_id={Number(user.user_id)} onUpdateRecipes={handleUpdateRecipes}/>
                </div>
            </div>
        </div>
    );
};

export default App;