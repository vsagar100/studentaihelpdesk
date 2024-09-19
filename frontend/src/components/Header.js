import React from 'react';
import '../styles/Header.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faBell } from '@fortawesome/free-solid-svg-icons';
import UserProfilePic from '../assets/images/admin.jpg'; // Import a smaller version of the user profile picture

const Header = ({ toggleSidebar }) => {
  return (
    <header className="header">
      <div className="header-left">
        <button className="hamburger" onClick={toggleSidebar}>
          <FontAwesomeIcon icon={faBars} />
        </button>
        <div className="brand">
          <h1>Admin Dashboard</h1>
        </div>
      </div>
      <div className="header-right">
        <FontAwesomeIcon icon={faBell} className="bell-icon" />
        <div className="user-info">
          <span className="user-name">John Doe</span>
          <img src={UserProfilePic} alt="User" className="user-pic-small" />
        </div>
      </div>
    </header>
  );
};

export default Header;
