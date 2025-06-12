import React, { useState } from 'react';
import './SignIn.css';
import loginImage from '../assets/png.png';
import { useNavigate, Link } from 'react-router-dom'; // ✅ FIXED: added Link here
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';


function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const validateAllFields = () => {
    const newErrors = {};

    // Email validation
    if (!emailRegex.test(email)) {
      newErrors.email = 'Invalid email format.';
      setEmail('');
    }

    // Password validation
    if (!passwordRegex.test(password)) {
      newErrors.password = 'Must include uppercase, number & special character.';
      setPassword('');
    }

    // Confirm password validation
    if (confirmPassword !== password || confirmPassword === '') {
      newErrors.confirmPassword = 'Passwords do not match.';
      setConfirmPassword('');
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateAllFields();
    if (!isValid) return;

    try {
      const response = await axios.post('http://localhost:8000/api/teacher/signup', {
        email,
        password,
      });

      if (response.status === 200 || response.status === 201) {
        navigate('/teacherlogin');
      } else {
        setErrors({ general: 'Signup failed. Please try again.' });
      }
    } catch (error) {
      console.error(error);
      setErrors({ general: 'Signup failed. User might already exist.' });
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <div className="signin-left">
          <img src={loginImage} alt="Login" />
        </div>
        <div className="signin-right">
          <h2>SIGN-UP</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={validateAllFields}
                placeholder=" "
                required
              />
              <label className={email ? 'filled' : ''}>E-mail</label>
              {errors.email && <p className="error">{errors.email}</p>}
            </div>

            <div className="input-group password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={validateAllFields}
                placeholder=" "
                required
              />
              <label className={password ? 'filled' : ''}>Password</label>
              <span onClick={() => setShowPassword(!showPassword)} className="eye-icon">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
              {errors.password && <p className="error">{errors.password}</p>}
            </div>

            <div className="input-group password-wrapper">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={validateAllFields}
                placeholder=" "
                required
              />
              <label className={confirmPassword ? 'filled' : ''}>Confirm Password</label>
              <span onClick={() => setShowConfirm(!showConfirm)} className="eye-icon">
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </span>
              {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
            </div>

            {errors.general && <p className="error">{errors.general}</p>}

            <button type="submit">Sign Up</button>
            <div className="login-option">
              Already have an account? <Link to="/teacherlogin">Log In</Link>
              <br />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
