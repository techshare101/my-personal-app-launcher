import React, { createContext, useContext, useState, useEffect } from 'react';
import { useFirestore } from '../hooks/useFirestore';

const AppsContext = createContext();

export function useApps() {
  return useContext(AppsContext);
}

export function AppsProvider({ children }) {
  const [apps, setApps] = useState([]);
  const firestore = useFirestore();

  useEffect(() => {
    if (firestore.apps) {
      setApps(firestore.apps);
    }
  }, [firestore.apps]);

  const value = {
    apps,
    setApps,
    loading: firestore.loading,
    addApp: firestore.addApp,
    updateApp: firestore.updateApp,
    deleteApp: firestore.deleteApp
  };

  return (
    <AppsContext.Provider value={value}>
      {children}
    </AppsContext.Provider>
  );
}
