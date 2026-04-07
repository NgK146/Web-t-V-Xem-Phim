import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const StaffRoute = ({ children }) => {
  const { user, token } = useAuthStore();

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'staff' && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default StaffRoute;
