// TeacherLogin.js
import React, { useState } from 'react';
import './Login.css';
import loginImage from '../assets/png.png';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function TeacherLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const newErrors = {};
    if (!emailRegex.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!passwordRegex.test(password)) {
      newErrors.password = 'Password must be at least 8 characters long and include an uppercase letter, a number, and a special character.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/teacher/login', {
        email,
        password,
      });

      if (response.status === 200 && response.data.success) {
        alert('Login successful!');
        navigate('/uploadfirstpage');
      } else {
        setErrors({ general: 'Invalid credentials' });
      }
    } catch (error) {
      console.error(error);
      setErrors({ general: 'Login failed: Check email and password.' });
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
            <div className="input-group">
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                required
                className={email ? 'filled' : ''}
              />
              <label className={email ? 'filled' : ''}>E-mail</label>
              {errors.email && <p className="error">{errors.email}</p>}
            </div>

            <div className="input-group password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                required
                className={password ? 'filled' : ''}
              />
              <label className={password ? 'filled' : ''}>Password</label>
              <span onClick={() => setShowPassword(!showPassword)} className="eye-icon">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
              {errors.password && <p className="error">{errors.password}</p>}
            </div>

            {errors.general && <p className="error">{errors.general}</p>}

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
