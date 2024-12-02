import React, {useState} from 'react';
import { FaUsers, FaUtensils, FaArrowLeft } from 'react-icons/fa';
import UserList from './UserList.tsx';
import '../App.css';
import RecipesAdminList from './RecipesAdminList.tsx';
import Recipe from '../DTO/Recipe';

interface AdminPanelProps {
    isAdminPanelOpen: boolean;
    onClose: () => void;
    recipes: Recipe[];
    user_id: number;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isAdminPanelOpen, onClose, recipes, user_id}) => {
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
                <button className="close-button" onClick={onClose}>X</button>
                {view !== 'buttons' && (
                    <button className="back-button" onClick={goBack}>
                        <FaArrowLeft size={24} />
                    </button>
                )}
                {view === 'buttons' && (
                    <div className="admin-buttons">
                        <button className="admin-button" onClick={onManageUsers}>
                            Manage Users
                            <FaUsers size={24} />
                        </button>
                        <button className="admin-button" onClick={onManageRecipes}>
                            Manage Recipes
                            <FaUtensils size={24} />
                        </button>
                    </div>
                )}
                {view === 'users' && (
                    <UserList/>
                )}
                {view === 'recipes' && (
                    <div className="recipe-list">
                        <RecipesAdminList recipes={recipes} user_id={user_id}/>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;