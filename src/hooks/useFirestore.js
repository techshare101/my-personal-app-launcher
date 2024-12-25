import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc } from '@firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

// Sample utility apps with proper URLs and icons
const UTILITY_APPS = [
  {
    id: 'system-optimizer',
    name: 'System Optimizer Pro',
    description: 'Comprehensive system optimization and cleanup tool',
    category: 'utility',
    url: 'https://www.ccleaner.com/',
    thumbnail: 'https://cdn-icons-png.flaticon.com/512/1163/1163624.png',
    features: [
      'System cleanup',
      'Performance optimization',
      'Startup management',
      'Disk analyzer'
    ]
  },
  {
    id: 'backup-master',
    name: 'BackupMaster',
    description: 'Automated backup and data protection solution',
    category: 'utility',
    url: 'https://www.backblaze.com/',
    thumbnail: 'https://cdn-icons-png.flaticon.com/512/1091/1091058.png',
    features: [
      'Automated backups',
      'Cloud integration',
      'File versioning',
      'Encryption'
    ]
  },
  {
    id: 'security-guard',
    name: 'SecurityGuard',
    description: 'System security and monitoring tool',
    category: 'utility',
    url: 'https://www.malwarebytes.com/',
    thumbnail: 'https://cdn-icons-png.flaticon.com/512/2092/2092663.png',
    features: [
      'Real-time protection',
      'Firewall management',
      'Vulnerability scanning',
      'Privacy protection'
    ]
  }
];

export function useFirestore() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setApps([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, 'apps'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const appsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          category: doc.data().category?.toLowerCase() || 'other',
          // Ensure URL has proper protocol
          url: ensureHttps(doc.data().url)
        }));

        // Add utility apps with current user ID
        const utilityApps = UTILITY_APPS.map(app => ({
          ...app,
          userId: currentUser.uid
        }));

        setApps([...appsData, ...utilityApps]);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error('Error loading apps:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const ensureHttps = (url) => {
    if (!url) return '';
    if (url.startsWith('http://')) {
      return url.replace('http://', 'https://');
    }
    if (!url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  };

  const saveApp = async (appData) => {
    if (!currentUser) throw new Error('No authenticated user');

    try {
      // Validate required fields
      if (!appData.name) throw new Error('App name is required');
      if (!appData.description) throw new Error('App description is required');

      const appRef = collection(db, 'apps');
      const appToSave = {
        ...appData,
        userId: currentUser.uid,
        category: appData.category?.toLowerCase() || 'other',
        url: ensureHttps(appData.url || ''), // Make URL optional
        createdAt: new Date().toISOString(),
        status: appData.status || 'active',
        source: appData.source || 'recommendation', // Track where the app came from
        lastModified: new Date().toISOString()
      };

      const docRef = await addDoc(appRef, appToSave);
      return docRef.id;
    } catch (err) {
      console.error('Error saving app:', err);
      throw err;
    }
  };

  const deleteApp = async (appId) => {
    if (!currentUser) throw new Error('No authenticated user');

    try {
      // Don't allow deletion of utility apps
      if (UTILITY_APPS.some(app => app.id === appId)) {
        throw new Error('Cannot delete system utility apps');
      }

      const appRef = doc(db, 'apps', appId);
      await deleteDoc(appRef);
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
