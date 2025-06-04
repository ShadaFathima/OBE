import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import loginImage from '../assets/png.png';

function StudentLogin() {
  const [registerNo, setRegisterNo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:8000/login/', {
        register_no: registerNo,
        password: password,
      });

      if (response.data.success) {
        alert('Login successful!');
        navigate(`/student-dashboard/${registerNo}`);
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div className="login-background">
      <div className="login-box">
        <div className="login-left">
          <img src={loginImage} alt="Login" />
        </div>
        <div className="login-right">
          <h2>LOGIN</h2>
          <form onSubmit={handleSubmit}>
            <label>Register No:</label>
            <input
              type="text"
              value={registerNo}
              onChange={(e) => setRegisterNo(e.target.value)}
              required
            />

            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">Login</button>

            {error && <p className="error-text">{error}</p>}

            <div className="signin-option">
              <a href="#">Forgot Password?</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default StudentLogin;
