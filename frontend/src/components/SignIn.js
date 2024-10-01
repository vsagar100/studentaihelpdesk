import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from '../GlobalState';
import '../styles/SignIn.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';

const SignIn = ({ onRoleChange, onUserDetailsChange }) => {
  const { BACKEND_API_URL } = useContext(GlobalContext);
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleRoleChange = (newRole) => {
    setRole(newRole.toLowerCase());
    if (onRoleChange) onRoleChange(newRole.toLowerCase());
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        const userRole = data.user.role.charAt(0).toUpperCase() + data.user.role.slice(1);
        onRoleChange(userRole);
        onUserDetailsChange(data.user.username, data.user.file_path != null ? data.user.file_path : '');
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', userRole);
        localStorage.setItem('userName', data.user.username);
        localStorage.setItem('userProfilePic', data.user.file_path != null ? data.user.file_path : '');

        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        navigate(`/${userRole.toLowerCase()}/dashboard`);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="signin-container">
      <h1 className="main-heading">Grievance System</h1>
      <h2 className="sub-heading">Sign In</h2>
      {/*
      <div className="role-selection">
        <button
          className={`role-button ${role === 'admin' ? 'active' : ''}`}
          onClick={() => handleRoleChange('admin')}
        >
          Admin
        </button>
        <button
          className={`role-button ${role === 'student' ? 'active' : ''}`}
          onClick={() => handleRoleChange('student')}
        >
          Student
        </button>
        <button
          className={`role-button ${role === 'staff' ? 'active' : ''}`}
          onClick={() => handleRoleChange('staff')}
        >
          Staff
        </button>
      </div>
      */}
      <form onSubmit={handleSignIn}>
        <div className="form-group">
          <div className="input-wrapper">
            <FontAwesomeIcon icon={faUser} className="input-icon" />
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <div className="input-wrapper">
            <FontAwesomeIcon icon={faLock} className="input-icon" />
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="form-options">
          <label>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            Remember me
          </label>
          <a href="#" className="forgot-password">
            Forgot Password?
          </a>
        </div>
        <button type="submit" className="btn btn-primary">
          Sign In
        </button>
      </form>

      <div className="sign-up">
        <p>Don't have an account? <a href="/signup">Sign Up</a></p>
      </div>
    </div>
  );
};

export default SignIn;
