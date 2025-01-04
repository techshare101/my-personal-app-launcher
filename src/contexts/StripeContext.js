import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const StripeContext = createContext();

export const useStripe = () => {
  return useContext(StripeContext);
};

export const StripeProvider = ({ children }) => {
  const [stripeCustomerId, setStripeCustomerId] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Fetch or create Stripe customer ID
      const fetchCustomerId = async () => {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists() && userDoc.data().stripeCustomerId) {
          setStripeCustomerId(userDoc.data().stripeCustomerId);
        }
      };

      fetchCustomerId();
    }
  }, [user]);

  const createCheckoutSession = async (priceId) => {
    try {
      const checkoutRef = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user.uid,
          customerId: stripeCustomerId,
          trial_period_days: 14 // Add 14-day trial
        }),
      });

      const { sessionId } = await checkoutRef.json();
      const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  };

  const createPortalSession = async () => {
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          customerId: stripeCustomerId,
          returnUrl: window.location.origin + '/settings',
        }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw error;
    }
  };

  const verifySubscription = async (sessionId) => {
    try {
      const response = await fetch('/api/verify-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          userId: user.uid,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify subscription');
      }

      const data = await response.json();
      setSubscription(data.subscription);
      return data;
    } catch (error) {
      console.error('Error verifying subscription:', error);
      throw error;
    }
  };

  const startTrial = async () => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const timestamp = new Date();
      const trialEnd = new Date(timestamp.setDate(timestamp.getDate() + 14));
      
      await updateDoc(userRef, {
        trial: {
          isActive: true,
          startDate: new Date(),
          endDate: trialEnd
        }
      });
    } catch (error) {
      console.error('Error starting trial:', error);
      throw error;
    }
  };

  const value = {
    stripeCustomerId,
    subscription,
    createCheckoutSession,
    createPortalSession,
    verifySubscription,
    startTrial
  };

  return (
    <StripeContext.Provider value={value}>
      {children}
    </StripeContext.Provider>
  );
};
