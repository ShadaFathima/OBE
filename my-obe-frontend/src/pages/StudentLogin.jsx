import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import loginImage from '../assets/png.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function StudentLogin() {
  const [registerNo, setRegisterNo] = useState('');
  const [password, setPassword] = useState('123456'); // Default password for testing
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:8000/api/login/', {
        register_no: registerNo,
        password: password,
      });

      if (response.data.success) {
        alert('Login successful!');
        navigate(`/studentdashboardview/${registerNo}`);
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
            <div className="input-group">
              <input
                type="text"
                value={registerNo}
                onChange={(e) => setRegisterNo(e.target.value)}
                placeholder=" "
                required
              />
              <label className={registerNo ? 'filled' : ''}>Register No</label>
            </div>

            <div className="input-group password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                required
              />
              <label className={password ? 'filled' : ''}>Password</label>
              <span onClick={() => setShowPassword(!showPassword)} className="eye-icon">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {error && <p className="error">{error}</p>}

            <button type="submit">Login</button>

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
