import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  getRedirectResult
} from 'firebase/auth';
import { auth } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to create or update user document
  const createUserDocument = async (user) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      try {
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date(),
          lastLogin: new Date()
        });
        console.log('User document created');
      } catch (error) {
        console.error('Error creating user document:', error);
      }
    } else {
      try {
        await setDoc(userRef, {
          lastLogin: new Date()
        }, { merge: true });
        console.log('User last login updated');
      } catch (error) {
        console.error('Error updating user last login:', error);
      }
    }
  };

  useEffect(() => {
    try {
      // Check for redirect result first
      getRedirectResult(auth)
        .then((result) => {
          if (result?.user) {
            createUserDocument(result.user);
          }
        })
        .catch((error) => {
          console.error('Redirect result error:', error);
          if (error.code === 'auth/popup-closed-by-user') {
            setError('Sign-in popup was closed. Please try again.');
          } else {
            setError(error.message);
          }
        });

      // Then set up auth state listener
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
        if (user) {
          createUserDocument(user);
        }
        setCurrentUser(user);
        setLoading(false);
        setError(null);
      }, (error) => {
        console.error('Auth state change error:', error);
        setError(error.message);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Auth initialization error:', error);
      setError(error.message);
      setLoading(false);
    }
  }, []);

  const signUp = async (email, password) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await createUserDocument(result.user);
      return result.user;
    } catch (error) {
      console.error('Error signing up with email/password:', error);
      setError(error.message);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error('Error signing in with email/password:', error);
      setError(error.message);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      const result = await signInWithPopup(auth, provider);
      await createUserDocument(result.user);
      return result.user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed. Please try again.');
      } else {
        setError(error.message);
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      setError(error.message);
      throw error;
    }
  };

  const value = {
    currentUser,
    signUp,
    login,
    loginWithGoogle,
    logout,
    error,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
