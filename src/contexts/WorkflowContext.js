import React, { createContext, useContext, useState, useEffect } from 'react';
import { useFirestore } from '../hooks/useFirestore';

const WorkflowContext = createContext();

export function useWorkflows() {
  return useContext(WorkflowContext);
}

export function WorkflowProvider({ children }) {
  const [workflows, setWorkflows] = useState([]);
  const firestore = useFirestore();

  useEffect(() => {
    if (firestore.workflows) {
      setWorkflows(firestore.workflows);
    }
  }, [firestore.workflows]);

  const value = {
    workflows,
    setWorkflows,
    loading: firestore.loading,
    addWorkflow: firestore.addWorkflow,
    updateWorkflow: firestore.updateWorkflow,
    deleteWorkflow: firestore.deleteWorkflow
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
}
