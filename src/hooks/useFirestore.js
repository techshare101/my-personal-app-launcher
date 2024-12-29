import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc, addDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
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

    const loadData = async () => {
      setLoading(true);
      try {
        // Load apps
        const appsQuery = query(
          collection(db, 'apps'),
          where('userId', '==', currentUser.uid)
        );
        const appsSnapshot = await getDocs(appsQuery);
        const appsData = appsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setApps(appsData);

        // Load workflows
        const workflowsQuery = query(
          collection(db, 'workflows'),
          where('userId', '==', currentUser.uid)
        );
        const workflowsSnapshot = await getDocs(workflowsQuery);
        const workflowsData = workflowsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setWorkflows(workflowsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  const addApp = async (appData) => {
    try {
      const userAppsRef = collection(db, 'users', currentUser.uid, 'apps');
      const docRef = await addDoc(userAppsRef, {
        ...appData,
        createdAt: serverTimestamp(),
      });
      const newApp = { id: docRef.id, ...appData, createdAt: serverTimestamp() };
      setApps(prev => [...prev, newApp]);
      return newApp;
    } catch (error) {
      console.error('Error adding app:', error);
      throw error;
    }
  };

  const updateApp = async (id, data) => {
    try {
      const appRef = doc(db, 'apps', id);
      await updateDoc(appRef, data);
      setApps(prev => prev.map(app => 
        app.id === id ? { ...app, ...data } : app
      ));
    } catch (error) {
      console.error('Error updating app:', error);
      throw error;
    }
  };

  const deleteApp = async (id) => {
    try {
      await deleteDoc(doc(db, 'apps', id));
      setApps(prev => prev.filter(app => app.id !== id));
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
      const newWorkflow = { id: docRef.id, ...workflowData };
      setWorkflows(prev => [...prev, newWorkflow]);
      return newWorkflow;
    } catch (error) {
      console.error('Error adding workflow:', error);
      throw error;
    }
  };

  const updateWorkflow = async (id, data) => {
    try {
      const workflowRef = doc(db, 'workflows', id);
      await updateDoc(workflowRef, data);
      setWorkflows(prev => prev.map(workflow => 
        workflow.id === id ? { ...workflow, ...data } : workflow
      ));
    } catch (error) {
      console.error('Error updating workflow:', error);
      throw error;
    }
  };

  const deleteWorkflow = async (id) => {
    try {
      await deleteDoc(doc(db, 'workflows', id));
      setWorkflows(prev => prev.filter(workflow => workflow.id !== id));
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
