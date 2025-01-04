import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, getDoc, addDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export function useFirestore() {
  const [apps, setApps] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setApps([]);
      setWorkflows([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Set up real-time listener for apps
    const userAppsRef = collection(db, 'users', currentUser.uid, 'apps');
    const unsubscribeApps = onSnapshot(userAppsRef, (snapshot) => {
      const appsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setApps(appsData);
      setLoading(false);
    }, (error) => {
      console.error('Error loading apps:', error);
      setLoading(false);
    });

    // Set up real-time listener for workflows
    const workflowsQuery = query(
      collection(db, 'workflows'),
      where('userId', '==', currentUser.uid)
    );
    const unsubscribeWorkflows = onSnapshot(workflowsQuery, (snapshot) => {
      const workflowsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWorkflows(workflowsData);
    }, (error) => {
      console.error('Error loading workflows:', error);
    });

    // Cleanup function to unsubscribe from listeners
    return () => {
      unsubscribeApps();
      unsubscribeWorkflows();
    };
  }, [currentUser]);

  const addApp = async (appData) => {
    try {
      const userAppsRef = collection(db, 'users', currentUser.uid, 'apps');
      const docRef = await addDoc(userAppsRef, {
        ...appData,
        createdAt: serverTimestamp(),
      });
      return { id: docRef.id, ...appData };
    } catch (error) {
      console.error('Error adding app:', error);
      throw error;
    }
  };

  const updateApp = async (id, data) => {
    try {
      const userAppsRef = doc(db, 'users', currentUser.uid, 'apps', id);
      await updateDoc(userAppsRef, data);
    } catch (error) {
      console.error('Error updating app:', error);
      throw error;
    }
  };

  const deleteApp = async (id) => {
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'apps', id));
    } catch (error) {
      console.error('Error deleting app:', error);
      throw error;
    }
  };

  const addWorkflow = async (workflowData) => {
    try {
      const docRef = await addDoc(collection(db, 'workflows'), {
        ...workflowData,
        userId: currentUser.uid,
        createdAt: new Date().toISOString()
      });
      return { id: docRef.id, ...workflowData };
    } catch (error) {
      console.error('Error adding workflow:', error);
      throw error;
    }
  };

  const updateWorkflow = async (id, data) => {
    try {
      await updateDoc(doc(db, 'workflows', id), data);
    } catch (error) {
      console.error('Error updating workflow:', error);
      throw error;
    }
  };

  const deleteWorkflow = async (id) => {
    try {
      await deleteDoc(doc(db, 'workflows', id));
    } catch (error) {
      console.error('Error deleting workflow:', error);
      throw error;
    }
  };

  return {
    apps,
    workflows,
    loading,
    addApp,
    updateApp,
    deleteApp,
    addWorkflow,
    updateWorkflow,
    deleteWorkflow
  };
}
