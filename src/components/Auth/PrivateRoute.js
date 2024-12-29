import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    // You can return a loading spinner here
    return <div>Loading...</div>;
  }

  return currentUser ? children : <Navigate to="/login" />;
}
