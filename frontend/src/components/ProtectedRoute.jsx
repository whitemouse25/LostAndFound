import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAdminAuthenticated } from '../services/authService';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = isAdminAuthenticated();

  if (!isAuthenticated) {
    // Clear any invalid data from localStorage
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute; 