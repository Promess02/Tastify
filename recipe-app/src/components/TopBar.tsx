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
    toggleLogin: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ user, isLoggedIn, searchTerm, handleSearch, handleLogout, resetPassword, toggleDrawer, openAdminPanel, toggleLogin }) => {
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
                {isLoggedIn ? (
                <div className="profile-button">
                    <FaUserCircle size={24} />
                    <p>{user.email}</p>
                    <button onClick={handleLogout}><b>Logout</b></button>
                    <button className="two-line-button" onClick={resetPassword}>
                    <b>Reset<br />Password</b>
                    </button>
                    {user.permission === 'admin' && <button className="two-line-button" onClick={openAdminPanel}><b>Admin<br/> panel</b></button>}
                </div>
            ) : (
                <button className="login-toggle-button" onClick={toggleLogin}><b>Login</b></button>
            )}
        </div>
    );
};

export default TopBar;