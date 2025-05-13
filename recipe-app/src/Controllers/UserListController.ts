import axios from 'axios';
import User from '../DTO/User';

const API_URL = 'http://localhost:4000/users';

export const fetchUsers = async (): Promise<User[]> => {
    try {
        const response = await axios.get(API_URL, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

export const updateUserPermission = async (userId: number, newPermission: 'user' | 'admin'): Promise<void> => {
    try {
        await axios.put(
            `${API_URL}/${userId}/permissions`,
            { permission: newPermission },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            }
        );
    } catch (error) {
        console.error('Error updating user permission:', error);
        throw error;
    }
};

export const updateUserBlockStatus = async (userId: number, isBlocked: boolean): Promise<void> => {
    try {
        const endpoint = isBlocked ? 'block' : 'unblock';
        await axios.put(
            `${API_URL}/${userId}/${endpoint}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            }
        );
    } catch (error) {
        console.error('Error updating user block status:', error);
        throw error;
    }
};