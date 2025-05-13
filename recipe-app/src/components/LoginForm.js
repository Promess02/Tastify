import React, { useState } from 'react';
import { loginUser, registerUser } from '../Controllers/LoginController.ts';

const Login = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [message, setMessage] = useState('');
    const [resetPassword, setResetPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
         try {
            if (isRegister) {
                await registerUser(email, password);
                setMessage('Registration successful!');
            } else {
                const data = await loginUser(email, password);
                setMessage('Login successful!');
                localStorage.setItem('token', data.token);
                onLoginSuccess(data.token);
            }
        } catch (err) {
            setMessage(err);
        }
    };

    const handleResetPassword = async (e) => {

    }

    return (
        <div className='login-container'>
            <h2>{isRegister ? 'Register' : 'Login'}</h2>
            <form onSubmit={handleSubmit}>
                <div className='form-group'>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className='form-group'>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className='submit-button'>{isRegister ? 'Register' : 'Login'}</button>
            </form>
            {message && <p className='message'>{message}</p>}
            <p className='toggle'>
                {isRegister ? (
                    <span onClick={() => {
                        setIsRegister(false);
                        setMessage('')}}>Already registered? Click here to login.</span>
                ) : (
                    <span onClick={() => {setIsRegister(true);
                        setMessage('');
                    }}>Click if you are not registered yet.</span>
                )}
            </p>
            <p className='toggle'><span onClick={setResetPassword}>Did you forget your password?</span></p>
        </div>
    );
};

export default Login;