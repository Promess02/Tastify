import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isRegister ? '/register' : '/login';
        try {
            const response = await axios.post(`http://localhost:4000${endpoint}`, { email, password });
            setMessage(isRegister ? 'Registration successful!' : 'Login successful!');
            if (!isRegister) {
                localStorage.setItem('token', response.data.token);
                onLoginSuccess(response.data.token);
            }
        } catch (err) {
            setMessage(err.response.data.error);
        }
    };

    return (
        <div className='login-container'>
            <h2>{isRegister ? 'Register' : 'Login'}</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">{isRegister ? 'Register' : 'Login'}</button>
            </form>
            <p>{message}</p>
            <p>
                {isRegister ? (
                    <span onClick={() => setIsRegister(false)}>Already registered? Click here to login.</span>
                ) : (
                    <span onClick={() => setIsRegister(true)}>Click if you are not registered yet.</span>
                )}
            </p>
        </div>
    );
};

export default Login;