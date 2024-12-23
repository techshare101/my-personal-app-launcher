import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from '@firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { integrationService } from '../services/integrationService';

export function useIntegrations() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setIntegrations([]);
      setLoading(false);
      return;
    }

    const integrationsRef = collection(db, 'integrations');
    const q = query(integrationsRef, where('userId', '==', currentUser.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const integrationList = [];
      snapshot.forEach((doc) => {
        integrationList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setIntegrations(integrationList);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching integrations:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const createIntegration = async (integration) => {
    try {
      return await integrationService.createIntegration(currentUser.uid, integration);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const testIntegration = async (integrationId) => {
    try {
      return await integrationService.testIntegration(integrationId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteIntegration = async (integrationId) => {
    try {
      await integrationService.deleteIntegration(integrationId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    integrations,
    loading,
    error,
    createIntegration,
    testIntegration,
    deleteIntegration
  };
}
