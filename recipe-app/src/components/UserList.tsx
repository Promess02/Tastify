import React, { useState, useEffect } from 'react';
import User from '../DTO/User';
import '../App.css';
import axios from 'axios';

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBlocked, setFilterBlocked] = useState<'all' | 'blocked' | 'active'>('all');
    const [filterPermission, setFilterPermission] = useState<'all' | 'user' | 'admin'>('all');
    const usersPerPage = 8;

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const filteredUsers = users.filter(user => {
        const matchesSearchTerm = user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBlockedFilter = filterBlocked === 'all' || user.block === filterBlocked;
        const matchesPermissionFilter = filterPermission === 'all' || user.permission === filterPermission;
        return matchesSearchTerm && matchesBlockedFilter && matchesPermissionFilter;
    });
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    const totalPages = Math.ceil(users.length / usersPerPage);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:4000/users', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setUsers(response.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchUsers();

    }, []);

    const handlePermissionChange = async (userId: number, newPermission: 'user' | 'admin') => {
        try {
            await axios.put(`http://localhost:4000/users/${userId}/permissions`, {
                permission: newPermission
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setUsers(prevUsers => prevUsers.map(user => 
                user.user_id === userId ? { ...user, permission: newPermission } : user
                )
            );
        } catch (err) {
            console.error('Error changing permission:', err);
        }
    };

    const handleBlockChange = async (userId: number, isBlocked: boolean) => {
        try {
            const endpoint = isBlocked ? 'block' : 'unblock';
            await axios.put(`http://localhost:4000/users/${userId}/${endpoint}`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.user_id === userId ? { ...user, block: isBlocked ? 'blocked' : 'active' } : user
                )
            );
        } catch (err) {
            console.error('Error changing block status:', err);
        }
    };

    return (
        <div className="user-list">
            <h2>Users</h2>
            <div className='search-container'>
                <input
                    type="text"
                    placeholder="Search users by email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-bar"
                />
                <select
                    value={filterBlocked}
                    onChange={(e) => setFilterBlocked(e.target.value as 'all' | 'blocked' | 'active')}
                    className="filter-dropdown"
                >
                    <option value="all">All Users</option>
                    <option value="blocked">Blocked Users</option>
                    <option value="active">Active Users</option>
                </select>
                <select
                    value={filterPermission}
                    onChange={(e) => setFilterPermission(e.target.value as 'all' | 'user' | 'admin')}
                    className="filter-dropdown"
                >
                    <option value="all">All Permissions</option>
                    <option value="user">Users</option>
                    <option value="admin">Admins</option>
                </select>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Permission</th>
                        <th>Block</th>
                    </tr>
                </thead>
                <tbody>
                    {currentUsers.map(user => (
                        <tr key={user.user_id}>
                            <td>{user.email}</td>
                            <td>
                                <select
                                    className='filter-dropdown'
                                    value={user.permission}
                                    onChange={(e) => handlePermissionChange(user.user_id, e.target.value as 'user' | 'admin')}
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </td>
                            <td>
                                <input
                                    className='input-checkbox'
                                    type="checkbox"
                                    checked={user.block === 'blocked'}
                                    onChange={(e) => handleBlockChange(user.user_id, e.target.checked)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="pagination">
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => handlePageChange(index + 1)}
                        className={currentPage === index + 1 ? 'active' : ''}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default UserList;