import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // If no token, navigate to the login page
    return <Navigate to="/adminsignin" replace />;
  }

  // If authenticated, allow access to the protected component
  return children;
};

export default ProtectedRoute;
