import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their default dashboard if not authorized
    const rolePaths = {
      student: '/student-dashboard',
      parent: '/parent-dashboard',
      librarian: '/library',
      finance: '/finance',
      admin: '/'
    };
    return <Navigate to={rolePaths[user.role] || '/'} replace />;
  }

  return children;
};

export default ProtectedRoute;
