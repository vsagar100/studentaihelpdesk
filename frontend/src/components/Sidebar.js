import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Use useNavigate for navigation
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUser, faBook, faBell, faCog, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import '../styles/SideBar.css';
import { UserContext } from './UserContext'; // Import UserContext
import UserProfilePic from '../assets/images/logo.png';
import { SidebarContext } from '../contexts/SidebarContext';


const Sidebar = ({ userRole, userName, userProfilePic }) => {
  const { user, setUser } = useContext(UserContext); // Get user and setUser from context
  const navigate = useNavigate(); // For navigating on logout
  const { isSidebarOpen, toggleSidebar } = useContext(SidebarContext);

  const toCamelCase = (str) => {
  return str
    .toLowerCase() // Convert the whole string to lower case
    .split(' ')    // Split the string by spaces
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
    .join(' ');    // Join the words back together
};

  let menuItems = [];

  // Define menu items based on user role
  
  menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: faHome },
    { path: '/admin/usermgmt', label: 'User Management', icon: faCog },
    //{ path: '/admin/support', label: 'Test', icon: faQuestionCircle },
  ];
  

  const handleLogout = () => {
    // Clear user context and token
    setUser(null); // Reset user context
    localStorage.removeItem('token'); // Clear token from localStorage if applicable
    navigate('/adminsignin'); // Redirect to SignIn page
  };

  return (
    <div className={`sidebar ${isSidebarOpen ? 'open' : 'collapsed'}`}>
      {/* User Profile Section */}
      <div className="user-profile">
        <img src={UserProfilePic} alt="User Profile" className="profile-pic" />
        <div className="user-info">
          <span className="user-name">{user?.username ? toCamelCase(user.username) : 'Guest'}</span>
          {/* <span className="user-role">{user?.role ? toCamelCase(user.role) : 'No Role Assigned'}</span> */}
        </div>
      </div>

      {/* Menu Items */}
      <ul>
        {menuItems.map((item, index) => (
          <li key={index}>
            <Link to={item.path}>
              <FontAwesomeIcon icon={item.icon} className="icon" />
              <span className="menu-label">{item.label}</span>
            </Link>
          </li>
        ))}
        <li>
          <Link onClick={handleLogout} to="#">
            <FontAwesomeIcon icon={faUser} className="icon" />
            <span className="menu-label">Logout</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
