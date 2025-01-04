import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useStripe } from '../contexts/StripeContext';

export default function ProtectedRoute({ children, requireSubscription = false }) {
  const { user } = useAuth();
  const { subscription } = useStripe();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireSubscription && (!subscription || subscription.status !== 'active')) {
    return <Navigate to="/pricing" />;
  }

  return children;
}
