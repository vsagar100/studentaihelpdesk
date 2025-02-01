import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Use useNavigate for navigation
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUser, faBook, faBell, faCog, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import '../styles/SideBar.css';
import { UserContext } from './UserContext'; // Import UserContext

const Sidebar = ({ isSidebarOpen }) => {
  const { user, setUser } = useContext(UserContext); // Get user and setUser from context
  const navigate = useNavigate(); // For navigating on logout
  
  const toCamelCase = (str) => {
  return str
    .toLowerCase() // Convert the whole string to lower case
    .split(' ')    // Split the string by spaces
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
    .join(' ');    // Join the words back together
};

  let menuItems = [];

  // Define menu items based on user role
  if (user && user.role && user.role.toLowerCase() === 'student') {
    menuItems = [
      { path: '/student/dashboard', label: 'Dashboard', icon: faHome },
      { path: '/student/helpdesk', label: 'Question', icon: faQuestionCircle },
      { path: '/student/addfaq', label: 'Add FAQ', icon: faCog },
      { path: '/student/my-grievances', label: 'My Grievances', icon: faUser },
      { path: '/student/resources', label: 'Resources', icon: faBook },
      { path: '/student/profile', label: 'Profile', icon: faUser },
      { path: '/student/announcements', label: 'Announcements', icon: faBell },
      { path: '/student/settings', label: 'Settings', icon: faCog },
      { path: '/student/activities', label: 'Student Activities', icon: faUser },
      { path: '/student/support', label: 'Support', icon: faQuestionCircle },
    ];
  } else if (user && user.role && user.role.toLowerCase() === 'staff') {
    menuItems = [
      { path: '/staff/dashboard', label: 'Dashboard', icon: faHome },
      { path: '/staff/assigned-grievances', label: 'Assigned Grievances', icon: faUser },
      { path: '/staff/manage-profile', label: 'Manage Profile', icon: faUser },
      { path: '/staff/resources', label: 'Resources', icon: faBook },
      { path: '/staff/announcements', label: 'Announcements', icon: faBell },
      { path: '/staff/settings', label: 'Settings', icon: faCog },
      { path: '/staff/support', label: 'Support', icon: faQuestionCircle },
    ];
  } else if (user && user.role && user.role.toLowerCase() === 'admin') {
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
    // Clear user context and token
    setUser(null); // Reset user context
    localStorage.removeItem('token'); // Clear token from localStorage if applicable
    navigate('/signin'); // Redirect to SignIn page
  };

  return (
    <div className={`sidebar ${isSidebarOpen ? 'open' : 'collapsed'}`}>
      {/* User Profile Section */}
      <div className="user-profile">
        <img src={user?.file_path || '/default-profile-pic.jpg'} alt="User Profile" className="profile-pic" />
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
          <Link  onClick={(e) => {
            e.preventDefault(); // Prevent default link behavior
            handleLogout();
          }} 
          to="#">
            <FontAwesomeIcon icon={faUser} className="icon" />
            <span className="menu-label">Logout</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
