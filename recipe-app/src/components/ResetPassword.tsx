import React, { useState } from 'react';
import axios from 'axios';

interface ResetPasswordProps {
    user_id: string;
    onClose: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ user_id, onClose }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
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

    return (
        <div className="reset-password">
            <form onSubmit={handleResetPassword}>
                <div className='form-group'>
                    <label>Old Password:</label>
                    <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                    />
                </div>
                <div className='form-group'>
                    <label>New Password:</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="error">{error}</p>}
                <button type="submit" className='toggle'>Reset Password</button>
                <button type="button" onClick={onClose} className='toggle'>Cancel</button>
            </form>
        </div>
    );
};

export default ResetPassword;