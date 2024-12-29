import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from '@firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export function useWorkflows() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    async function fetchWorkflows() {
      if (!currentUser) {
        setWorkflows([]);
        setLoading(false);
        return;
      }

      try {
        const workflowsRef = collection(db, 'users', currentUser.uid, 'workflows');
        const q = query(workflowsRef);
        const querySnapshot = await getDocs(q);
        
        const workflowList = [];
        querySnapshot.forEach((doc) => {
          workflowList.push({ id: doc.id, ...doc.data() });
        });
        
        setWorkflows(workflowList);
        setError(null);
      } catch (err) {
        console.error('Error fetching workflows:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchWorkflows();
  }, [currentUser]);

  const saveWorkflow = async (workflowData) => {
    if (!currentUser) {
      throw new Error('User must be logged in to save workflows');
    }

    try {
      const workflowsRef = collection(db, 'users', currentUser.uid, 'workflows');
      const docRef = await addDoc(workflowsRef, {
        ...workflowData,
        createdAt: serverTimestamp()
      });
      
      const newWorkflow = {
        id: docRef.id,
        ...workflowData,
        createdAt: new Date()
      };
      
      setWorkflows(prevWorkflows => [...prevWorkflows, newWorkflow]);
      return docRef.id;
    } catch (err) {
      console.error('Error saving workflow:', err);
      setError(err.message);
      throw err;
    }
  };

  const deleteWorkflow = async (workflowId) => {
    if (!currentUser) {
      throw new Error('User must be logged in to delete workflows');
    }

    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'workflows', workflowId));
      setWorkflows(prevWorkflows => prevWorkflows.filter(workflow => workflow.id !== workflowId));
    } catch (err) {
      console.error('Error deleting workflow:', err);
      setError(err.message);
      throw err;
    }
  };

  return {
    workflows,
    loading,
    error,
    saveWorkflow,
    deleteWorkflow
  };
}
