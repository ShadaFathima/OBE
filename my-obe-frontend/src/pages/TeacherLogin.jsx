// TeacherLogin.js
import React, { useState } from 'react';
import './Login.css';
import loginImage from '../assets/png.png';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function TeacherLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    if (!passwordRegex.test(password)) {
      alert(
        'Password must be at least 8 characters long and include at least one uppercase letter, one number, and one special character.'
      );
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/teacher/login', {
        email,
        password,
      });

      if (response.status === 200 && response.data.success) {
        alert('Login successful!');
        navigate('/teacherdashboard');
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error(error);
      alert('Login failed: Check email and password.');
    }

    clearForm();
  };

  const clearForm = () => {
    setEmail('');
    setPassword('');
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
            <label>Email:</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

            <div className="signin-option">
              Don't have an account? <Link to="/signin">Sign Up</Link>
              <br />
              <a href="#">Forgot Password?</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TeacherLogin;
