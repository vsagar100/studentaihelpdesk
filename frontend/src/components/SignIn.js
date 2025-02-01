import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from '../GlobalState';
import '../styles/SignIn.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import { UserContext } from './UserContext';

const SignIn = ({ onRoleChange, onUserDetailsChange }) => {
  const { BACKEND_API_URL } = useContext(GlobalContext);
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);  // Access user and setUser from context

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  // Log user when it gets updated
  useEffect(() => {
    if (user) {
      console.log('User updated in Context:', user);  // This will log when user state updates
    }
  }, [user]);

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
        // Set user in UserContext
        setUser({
          username: data.user.username,
          role: data.user.role,
          file_path: data.user.file_path,
        });

        // Store token in localStorage (if needed for future requests)
        localStorage.setItem('token', data.token);

        // Navigate to dashboard
        const userRole = data.user.role.charAt(0).toUpperCase() + data.user.role.slice(1);
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
