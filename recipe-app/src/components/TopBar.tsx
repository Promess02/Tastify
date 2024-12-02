import React from 'react';
import { FaUserCircle } from 'react-icons/fa';
import '../App.css';

interface TopBarProps {
    user: { email: string; permission: string };
    isLoggedIn: boolean;
    searchTerm: string;
    handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleLogout: () => void;
    handleLoginSuccess: (userData: { email: string; permission: string }) => void;
    resetPassword: () => void;
    toggleDrawer: () => void;
    openAdminPanel: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ user, isLoggedIn, searchTerm, handleSearch, handleLogout, resetPassword, toggleDrawer, openAdminPanel }) => {
    return (
        <div className="top-bar">
            <button className="filter-button" onClick={toggleDrawer}>Filter recipes</button>
            <div className='search-container'>
                <input
                    type="text"
                    placeholder="Search recipes..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="search-bar"
                />
            </div>
                {isLoggedIn && <div className='profile-button'>
                    <FaUserCircle size={24} />
                    <p>{user.email}</p>
                    <button onClick={handleLogout}><b>Logout</b></button>
                    <button onClick={resetPassword}><b>Reset Password</b></button>
                    {user.permission === 'admin' && <button onClick={openAdminPanel}><b>Admin panel</b></button>}
                </div>}
        </div>
    );
};

export default TopBar;