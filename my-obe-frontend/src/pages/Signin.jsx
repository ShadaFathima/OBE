import React, { useState } from 'react';
import './SignIn.css';
import loginImage from '../assets/png.png'; // Make sure this path matches your project

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      clearForm();
      return;
    }

    if (!passwordRegex.test(password)) {
      alert(
        'Password must be at least 8 characters long and include at least one uppercase letter, one number, and one special character.'
      );
      clearForm();
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      clearForm();
      return;
    }

    alert('Successfully signed in!');
    clearForm();
  };

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <div className="signin-left">
          <img src={loginImage} alt="Login" />
        </div>
        <div className="signin-right">
          <h2>SIGN-IN</h2>
          <form onSubmit={handleSubmit}>
            <label>E-mail</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
