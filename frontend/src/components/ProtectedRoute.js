import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ProtectedRoute = ({ children }) => {
  const { user, token } = useAuthStore();

  if (!user || !token) {
    // Chưa đăng nhập thì chuyển về trang landing
    return <Navigate to="/landing" replace />;
  }

  return children;
};

export default ProtectedRoute;
