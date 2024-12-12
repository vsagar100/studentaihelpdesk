import React, { useContext, useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';

import AdminUserManagement from './components/AdminUserManagement';
import AdminDashboard from './components/AdminDashboard';
import StudentHelpdesk from './components/StudentHelpdesk';
import SignIn from './components/SignIn';
import { SidebarContext } from './contexts/SidebarContext';
import './App.css';
import { UserProvider } from './components/UserContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const location = useLocation();
  const { isSidebarOpen } = useContext(SidebarContext);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [userProfilePic, setUserProfilePic] = useState('');

  const isDashboardRoute = location.pathname.includes('/admin/dashboard');
  const noAuthRoutes = ['/','/adminsignin', '/signup', '/chat', '/test'];

  return (
    <UserProvider>
     <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
        {!noAuthRoutes.includes(location.pathname) ? (
          <>         
            <Sidebar
              isSidebarOpen={isSidebarOpen}              
            />
             <div className="main-area">             
                 <Header />
                 <div className="main-content">
                    <Routes>
                      <Route 
                        path="/admin/dashboard" 
                        element={
                          <ProtectedRoute>
                            <AdminDashboard />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/usermgmt" 
                        element={
                          <ProtectedRoute>
                            <AdminUserManagement />
                          </ProtectedRoute>
                        } 
                      />
                    </Routes>
                <Footer />
             </div>                
            </div>
          </>
          
      ) : (
        <Routes>
          <Route path="/adminsignin" element={<SignIn />} />
          <Route path="/chat" element={<StudentHelpdesk />} />
          <Route path="/" element={<Navigate to="/chat" replace />} />
        </Routes>
      )}
     </div>
    </UserProvider>
  );
}

export default App;