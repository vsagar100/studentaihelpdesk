import React, { useContext } from 'react';
import '../styles/Header.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faBell } from '@fortawesome/free-solid-svg-icons';
import UserProfilePic from '../assets/images/admin.jpg'; // Import a smaller version of the user profile picture
import { UserContext } from './UserContext'; // Import UserContext

const Header = ({ toggleSidebar }) => {
  const { user, setUser } = useContext(UserContext); 
  const toCamelCase = (str) => {
  return str
    .toLowerCase() // Convert the whole string to lower case
    .split(' ')    // Split the string by spaces
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
    .join(' ');    // Join the words back together
};

  return (
    <header className="header">
      <div className="header-left">
        <button className="hamburger" onClick={toggleSidebar}>
          <FontAwesomeIcon icon={faBars} />
        </button>
        <div className="brand">
          <h1>{user?.role ? toCamelCase(user.role) : 'No Role Assigned'} Dashboard</h1>
        </div>
      </div>
      <div className="header-right">
        <FontAwesomeIcon icon={faBell} className="bell-icon" />
        <div className="user-info">
          <span className="user-name">{user?.username ? toCamelCase(user.username) : 'Guest'}</span>
          <img src={user?.file_path || '/default-profile-pic.jpg'} alt="User Profile" className="user-pic-small" />
        </div>
      </div>
    </header>
  );
};

export default Header;
