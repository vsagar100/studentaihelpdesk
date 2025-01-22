import React, { useState, useContext, useEffect, createContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { GlobalContext } from '../GlobalState';
import '../styles/SignIn.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import { UserContext } from './UserContext';
import Modal from './Modal';
import SigninImage from '../assets/images/bg-02.png';

const SignIn = ({ onRoleChange, onUserDetailsChange }) => {
  const { BACKEND_API_URL } = useContext(GlobalContext);
  const [showUserModal, setShowUserModal] = useState(false);
 // const [role, setRole] = useState('student');
  const [uname, setUName] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { setUser, user } = useContext(UserContext); // Access the context

 // useEffect(() => {
    
//  }, []);

  // Log user when it gets updated
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setUName(rememberedEmail);
      setRememberMe(true);
    }
    if (user) {
      console.log('User updated in Context:', user);  // This will log when user state updates
    }
  }, [user]);
  
  const handleHomeClick = async (e) => {
    return <Navigate to="/" replace />;
  
  }
  
  const handleOpenUserModal = () => {
    setShowUserModal(true);
  };

  const handleCloseUserModal = () => {
    setShowUserModal(false);
  };


  const handleSignIn = (e) => {
  e.preventDefault();

  // Dummy credentials for testing
  const dummyUsers = [
    {
      username: "admin",
      password: "admin123",
      role: "admin",
      token: "dummy-admin-token",
    },
    {
      username: "user",
      password: "user123",
      role: "user",
      token: "dummy-user-token",
    },
  ];

  // Simulate login verification
  const user = dummyUsers.find(
    (u) => u.username === uname && u.password === password
  );

  if (user) {
    // Simulate successful login response
    const dummyResponse = {
      status: "success",
      user: {
        username: user.username,
        role: user.role,
      },
      token: user.token,
    };

    console.log(dummyResponse);

    // Set user in UserContext
    setUser(dummyResponse.user);

    // Store token in localStorage (if needed for future requests)
    localStorage.setItem("token", dummyResponse.token);

    // Navigate to dashboard
    const userRole = dummyResponse.user.role.charAt(0).toUpperCase() + dummyResponse.user.role.slice(1);
    navigate(`/admin/dashboard`);
  } else {
    // Simulate failed login response
    alert("Invalid username or password.");
  }
};

  

  const handleForgotUser = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);   
    //const question = formData.get('question');
    //const keywords = formData.get('keywords');
    //const answer = formData.get('answer');
 
    
    try {      
      
        // Edit existing User
        const token = localStorage.getItem('token');
        const response = await fetch(`${BACKEND_API_URL}/api/auth/user/resetpwd`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            //'Content-Type': 'application/json',
          },
          body: formData,
        });

        if (response.ok) {
          console.log('User updated successfully');
           alert('Password reset successfully');
          handleCloseUserModal(); // Close modal after saving
        } else {
          console.error('Failed to update user credentials.');
          console.log(response);
          alert("Error occured, contact admin. "+formData.get('username') + " "+ response.statusText);
        }
       
    } catch (err) {
      console.log(err);
      console.error('Error saving User:', err);
      alert(err);
    }
  };

  return (
    <div className="signup-container">
      <div className="signin-left">
        <img src={SigninImage} alt="Signin Background" className="signin-image" />
      </div>      
      <div className="signin-right">
        <h1 className="main-heading">AI StudyPal</h1>
        <h2 className="sub-heading">Admin Sign In</h2>
        <form onSubmit={handleSignIn}>
          <div className="form-group">
            <div className="input-wrapper">
              <FontAwesomeIcon icon={faUser} className="input-icon" />
              <input
                type="text"
                className="form-control"
                placeholder="User name"
                value={uname}
                onChange={(e) => setUName(e.target.value)}
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
            <a href="#" onClick={() => handleOpenUserModal() } className="forgot-password">
              Forgot Password?
            </a>
          </div>
          <button type="submit" className="btn btn-primary">
            Sign In
          </button>
          <button type="button" onClick={handleHomeClick} className="btn role-button">
            Home
          </button>
        </form>
        
        {/* USer Modal */}
      <Modal show={showUserModal} handleClose={handleCloseUserModal} title="Forgot Password">
        <form onSubmit={handleForgotUser}>
          <div className="form-group">
            <label htmlFor="username">UserName:</label>
            <input type="text" id="username" name="username" className="form-control" required />
          </div>
          <div className="form-group">
            <label htmlFor="hint">Password Hint:</label>
            <input type="text" id="hint" name="hint" className="form-control" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">New Password:</label>
            <input type="password" id="password" name="password" className="form-control" required 
            minLength={8}
            pattern="^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$"
            title="Password must be at least 8 characters long, contain a letter, a number, and a special character"
             />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password:</label>
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword" 
              className="form-control" 
              required 
              onBlur={(e) => {
                const password = document.getElementById('password').value;
                const confirmPassword = e.target.value;
                console.log(password);
                console.log(confirmPassword);
                if (password != confirmPassword) {
                  e.target.setCustomValidity("Passwords do not match");
                } else {
                  e.target.setCustomValidity("");
                }
              }}
            />
            </div>
          
          <button type="submit" className="btn btn-primary">Save User</button>
        </form>
      </Modal>
      </div>
    </div>
  );
};

export default SignIn;
