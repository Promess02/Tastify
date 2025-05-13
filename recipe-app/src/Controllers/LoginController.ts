import axios from 'axios';

export const loginUser = async (email: string, password: string) => {
    try {
        const response = await axios.post('http://localhost:4000/login', { email, password });
        return response.data;
    } catch (error) {
        console.error('Error logging in:', error);
        throw error.response?.data?.error || 'Login failed';
    }
};

export const registerUser = async (email: string, password: string) => {
    try {
        const response = await axios.post('http://localhost:4000/register', { email, password });
        return response.data;
    } catch (error) {
        console.error('Error registering user:', error);
        throw error.response?.data?.error || 'Registration failed';
    }
};

export const resetPassword = async (user_id: string, oldPassword: string, newPassword: string, setError, onClose) => {
   try {
        const response = await axios.post('http://localhost:4000/auth/reset-password', {
            user_id,
            oldPassword,
            newPassword,
        });

        if(!response.data.success) {
            setError(response.data.message);
            return;
        }

        onClose();
    } catch (err) {
        setError(err.response?.data?.error || 'An error occurred');
    }
};
