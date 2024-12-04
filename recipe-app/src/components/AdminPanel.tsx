import React, {useState} from 'react';
import { FaUsers, FaUtensils, FaArrowLeft, FaTimes } from 'react-icons/fa';
import UserList from './UserList.tsx';
import '../App.css';
import RecipesAdminList from './RecipesAdminList.tsx';
import Recipe from '../DTO/Recipe';

interface AdminPanelProps {
    isAdminPanelOpen: boolean;
    onClose: () => void;
    recipes: Recipe[];
    user_id: number;
    onUpdateRecipes: (recipes: Recipe[]) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isAdminPanelOpen, onClose, recipes, user_id, onUpdateRecipes}) => {
    const [view, setView] = useState<'buttons' | 'users' | 'recipes'> ('buttons');

    const onManageUsers = () => {
        setView('users');
    };

    const onManageRecipes = () => {
        setView('recipes');
    };

    const goBack = () => {
        setView('buttons');
    };

    if (!isAdminPanelOpen) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>
                    <FaTimes size={40} />
                </button>
                {view !== 'buttons' && (
                    <button className="back-button" onClick={goBack}>
                        <FaArrowLeft size={40} />
                    </button>
                )}
                {view === 'buttons' && (
                    <div className="admin-buttons">
                        <button className="admin-button" onClick={onManageUsers}>
                            Manage Users
                            <FaUsers size={40} />
                        </button>
                        <button className="admin-button" onClick={onManageRecipes}>
                            Manage Recipes
                            <FaUtensils size={40} />
                        </button>
                    </div>
                )}
                {view === 'users' && (
                    <UserList/>
                )}
                {view === 'recipes' && (
                    <div className="recipe-list">
                        <RecipesAdminList recipes={recipes} user_id={user_id} onUpdateRecipes={onUpdateRecipes}/>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;