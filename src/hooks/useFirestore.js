import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc
} from '@firebase/firestore';
import { db, auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export function useFirestore() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    async function fetchApps() {
      if (!currentUser) {
        setApps([]);
        setLoading(false);
        return;
      }

      try {
        const appsRef = collection(db, 'apps');
        const q = query(appsRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const fetchedApps = [];
        querySnapshot.forEach((doc) => {
          fetchedApps.push({ id: doc.id, ...doc.data() });
        });
        
        setApps(fetchedApps);
        setError(null);
      } catch (err) {
        console.error('Error fetching apps:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchApps();
  }, [currentUser]);

  const saveApp = async (appData) => {
    if (!currentUser) {
      throw new Error('Must be logged in to save apps');
    }

    try {
      const appsRef = collection(db, 'apps');
      const docRef = await addDoc(appsRef, {
        ...appData,
        userId: currentUser.uid,
        createdAt: new Date().toISOString()
      });
      
      const newApp = { id: docRef.id, ...appData };
      setApps(prev => [...prev, newApp]);
      return newApp;
    } catch (err) {
      console.error('Error saving app:', err);
      throw err;
    }
  };

  const deleteApp = async (appId) => {
    if (!currentUser) {
      throw new Error('Must be logged in to delete apps');
    }

    try {
      await deleteDoc(doc(db, 'apps', appId));
      setApps(prev => prev.filter(app => app.id !== appId));
    } catch (err) {
      console.error('Error deleting app:', err);
      throw err;
    }
  };

  return {
    apps,
    loading,
    error,
    saveApp,
    deleteApp
  };
}
