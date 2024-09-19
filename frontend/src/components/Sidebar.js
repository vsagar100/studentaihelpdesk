import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUser, faBook, faBell, faCog, faQuestionCircle } from '@fortawesome/free-solid-svg-icons'; // Example icons
import '../styles/SideBar.css';

const Sidebar = ({ isSidebarOpen, userRole, userName, userProfilePic }) => {
  let menuItems = [];

  // Define menu items based on user role
  if (userRole != null && userRole.toLowerCase() === 'student') {
    menuItems = [
      { path: '/student/dashboard', label: 'Dashboard', icon: faHome },
      { path: '/student/helpdesk', label: 'Question', icon: faQuestionCircle },
      { path: '/student/my-grievances', label: 'My Grievances', icon: faUser },
      { path: '/student/resources', label: 'Resources', icon: faBook },
      { path: '/student/profile', label: 'Profile', icon: faUser },
      { path: '/student/announcements', label: 'Announcements', icon: faBell },
      { path: '/student/settings', label: 'Settings', icon: faCog },
      { path: '/student/activities', label: 'Student Activities', icon: faUser },
      { path: '/student/support', label: 'Support', icon: faQuestionCircle },
    ];
  } else if (userRole != null && userRole.toLowerCase() === 'staff') {
    menuItems = [
      { path: '/staff/dashboard', label: 'Dashboard', icon: faHome },
      { path: '/staff/assigned-grievances', label: 'Assigned Grievances', icon: faUser },
      { path: '/staff/manage-profile', label: 'Manage Profile', icon: faUser },
      { path: '/staff/resources', label: 'Resources', icon: faBook },
      { path: '/staff/announcements', label: 'Announcements', icon: faBell },
      { path: '/staff/settings', label: 'Settings', icon: faCog },
      { path: '/staff/support', label: 'Support', icon: faQuestionCircle },
    ];
  } else if (userRole != null && userRole.toLowerCase() === 'admin') {
    menuItems = [
      { path: '/admin/dashboard', label: 'Dashboard', icon: faHome },
      { path: '/admin/manage-staff', label: 'Manage Staff', icon: faUser },
      { path: '/admin/manage-students', label: 'Manage Students', icon: faUser },
      { path: '/admin/reports', label: 'Reports', icon: faBook },
      { path: '/admin/resources', label: 'Resources', icon: faBook },
      { path: '/admin/announcements', label: 'Announcements', icon: faBell },
      { path: '/admin/settings', label: 'Settings', icon: faCog },
      { path: '/admin/support', label: 'Support', icon: faQuestionCircle },
    ];
  }
  
  const handleLogout = () => {
    // Clear the session
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userProfilePic');
    navigate('/signin'); // Redirect to SignIn page
  };

  return (
    <div className={`sidebar ${isSidebarOpen ? 'open' : 'collapsed'}`}>
      {/* User Profile Section */}
      <div className="user-profile">
        <img src={userProfilePic} alt="User Profile" className="profile-pic" />
        <div className="user-info">
          <span className="user-name">{userName}</span>
          <span className="user-role">{userRole}</span>
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
          <Link onClick={handleLogout} to='#'>
            <FontAwesomeIcon icon={faUser} className="icon" />
            <span className="menu-label">Logout</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
