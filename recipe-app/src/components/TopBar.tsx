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

const TopBar: React.FC<TopBarProps> = ({
    user,
    isLoggedIn,
    searchTerm,
    handleSearch,
    handleLogout,
    toggleDrawer,
    openAdminPanel,
    toggleLogin,
}) => {
    return (
        <div className="top-bar" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1em' }}>
                <button className="filter-button" onClick={toggleDrawer}><b>Filter<br /> recipes</b></button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', marginLeft: 'auto' }}>
                    {isLoggedIn ? (
                        <div className="profile-button" style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                            <FaUserCircle size={24} />
                            <p style={{ whiteSpace: 'pre-line', margin: 0, wordBreak: 'break-all', textAlign: 'center' }}>
                            {user.email.replace('@', '\n@')}
                            </p>
                            <button onClick={handleLogout}><b>Logout</b></button>
                            {user.permission === 'admin' && (
                                <button className="two-line-button" onClick={openAdminPanel} style={{marginRight: '1em'}}>
                                    <b>Admin<br /> panel</b>
                                </button>
                            )}
                        </div>
                    ) : (
                        <button className="login-toggle-button" onClick={toggleLogin}><b>Login</b></button>
                    )}
                </div>
            </div>
            <div className="search-container" style={{ marginTop: '1em' }}>
                <input
                    type="text"
                    placeholder="Search recipes..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="search-bar"
                />
            </div>
        </div>
    );
};

export default TopBar;