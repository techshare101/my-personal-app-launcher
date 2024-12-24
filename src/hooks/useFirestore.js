import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc } from '@firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { cacheService } from '../services/cacheService';

export function useFirestore() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setApps([]);
      setLoading(false);
      setError('Please sign in to access your apps');
      return;
    }

    setLoading(true);
    setError(null);

    const loadApps = async () => {
      try {
        if (!isOnline) {
          // Load from cache when offline
          const cachedApps = await cacheService.getCachedApps();
          if (cachedApps.length > 0) {
            setApps(cachedApps.filter(app => app.userId === currentUser.uid));
          }
          setLoading(false);
          return;
        }

        const q = query(
          collection(db, 'apps'),
          where('userId', '==', currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
          try {
            const appsData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));

            // Cache apps for offline use
            for (const app of appsData) {
              await cacheService.cacheApp(app);
            }

            setApps(appsData);
            setLoading(false);
            setError(null);
          } catch (err) {
            console.error('Error processing apps data:', err);
            setError('Error loading apps: ' + err.message);
            setLoading(false);
          }
        }, (err) => {
          console.error('Error fetching apps:', err);
          if (err.code === 'permission-denied') {
            setError('Error loading apps: Missing or insufficient permissions. Please sign out and sign in again.');
          } else {
            setError('Error loading apps: ' + err.message);
          }
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (err) {
        console.error('Error in loadApps:', err);
        setError('Error loading apps: ' + err.message);
        setLoading(false);
      }
    };

    loadApps();
  }, [currentUser, isOnline]);

  const saveApp = async (appData) => {
    try {
      if (!currentUser) throw new Error('No authenticated user');

      const newApp = {
        ...appData,
        userId: currentUser.uid,
        createdAt: new Date().toISOString(),
        offlineCapable: appData.offlineCapable || false
      };

      if (!isOnline) {
        // Store in cache for sync later
        await cacheService.cacheApp({ id: Date.now().toString(), ...newApp });
        setApps(prevApps => [...prevApps, { id: Date.now().toString(), ...newApp }]);
        return;
      }

      const docRef = await addDoc(collection(db, 'apps'), newApp);
      await cacheService.cacheApp({ id: docRef.id, ...newApp });
      return docRef.id;
    } catch (err) {
      console.error('Error saving app:', err);
      throw err;
    }
  };

  const deleteApp = async (appId) => {
    try {
      if (!currentUser) throw new Error('No authenticated user');

      if (!isOnline) {
        // Mark for deletion when back online
        const settings = await cacheService.getSettings() || {};
        const deletionQueue = settings.deletionQueue || [];
        await cacheService.saveSettings({
          ...settings,
          deletionQueue: [...deletionQueue, appId]
        });
        setApps(prevApps => prevApps.filter(app => app.id !== appId));
        return;
      }

      await deleteDoc(doc(db, 'apps', appId));
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
    deleteApp,
    isOnline
  };
}
