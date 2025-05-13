import React, { useState } from 'react';
import { resetPassword } from '../Controllers/LoginController.ts';


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
        resetPassword(user_id, oldPassword, newPassword, setError, onClose);
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