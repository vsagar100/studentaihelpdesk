// App.js
import React, { useContext, useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import StudentDashboard from './components/StudentDashboard';
import StaffDashboard from './components/StaffDashboard';
import AdminDashboard from './components/AdminDashboard';
import StudentHelpdesk from './components/StudentHelpdesk';
import AddFAQ from './components/AddFAQ';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Test from './components/Test';
import { SidebarContext } from './contexts/SidebarContext';
import './App.css';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSidebarOpen, toggleSidebar } = useContext(SidebarContext);

  const [userRole, setUserRole] = useState(null); // Start with no role to check login
  const [userName, setUserName] = useState(''); // Initially empty
  const [userProfilePic, setUserProfilePic] = useState(''); // Initially empty

  useEffect(() => {
    // Load session from localStorage on page load/refresh
    const storedRole = localStorage.getItem('userRole');
    const storedName = localStorage.getItem('userName');
    const storedProfilePic = localStorage.getItem('userProfilePic');
    const token = localStorage.getItem('token');

    if (token && storedRole) {
      setUserRole(storedRole);
      setUserName(storedName);
      setUserProfilePic(storedProfilePic);
    } else if (!noAuthRoutes.includes(location.pathname)) {
      // If no token, redirect to SignIn
      navigate('/signin');
    }
  }, [location.pathname, navigate]);
  
  const handleRoleChange = (role) => {
    setUserRole(role);
    localStorage.setItem('userRole', role); // Store role in localStorage
  };

  const handleUserDetailsChange = (name, profilePic) => {
    setUserName(name);
    setUserProfilePic(profilePic);
    localStorage.setItem('userName', name); // Store username in localStorage
    localStorage.setItem('userProfilePic', profilePic); // Store profile pic in localStorage
  };
  
  const noAuthRoutes = ['/signin', '/signup', '/test'];
  

  return (
    <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      {!noAuthRoutes.includes(location.pathname) ? (
        <>
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            userRole={userRole}
            userName={userName}
            userProfilePic={userProfilePic}
          />
          <div className="main-area">
            <Header toggleSidebar={toggleSidebar} />
            <div className="main-content">
              <Routes>
                {userRole === 'Student' && (
                  <Route path="/student/dashboard" element={<StudentDashboard />} />
                )}
                {userRole === 'Staff' && (
                  <Route path="/staff/dashboard" element={<StaffDashboard />} />
                )}
                {userRole === 'Admin' && (
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                )}
                {userRole === 'Student' && (
                  <Route path="/student/helpdesk" element={<StudentHelpdesk />} />
                )}
                {userRole === 'Student' && (
                  <Route path="/student/addfaq" element={<AddFAQ />} />
                )}
                {/* Redirect root path to sign-in */}
                <Route path="/" element={<Navigate to="/signin" />} />
              </Routes>
              <Footer />
            </div>
          </div>
        </>
      ) : (
        <div className="auth-content">
          <Routes>
            <Route path="/signin" element={<SignIn onRoleChange={handleRoleChange} onUserDetailsChange={handleUserDetailsChange} />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/test" element={<Test />} />
          </Routes>
        </div>
      )}
    </div>
  );
}

export default App;
