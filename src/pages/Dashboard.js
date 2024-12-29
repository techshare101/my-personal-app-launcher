import React, { useState } from 'react';
import {
  Container,
  Grid,
  Tab,
  Tabs,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import AppList from '../components/AppList';
import AddAppDialog from '../components/AddAppDialog';
import WorkflowBuilder from '../components/WorkflowBuilder';
import WorkflowList from '../components/WorkflowList';
import Recommendations from '../components/Recommendations';
import IntegrationCenter from '../components/IntegrationCenter';
import { useAuth } from '../contexts/AuthContext';
import { useFirestore } from '../hooks/useFirestore';

export default function Dashboard() {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const { currentUser } = useAuth();
  const { apps, loading, error, addApp, deleteApp } = useFirestore();

  const handleAddApp = async (appData) => {
    try {
      await addApp(appData);
      setOpenAddDialog(false);
    } catch (error) {
      console.error('Error adding app:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error">Error: {error}</Typography>
      </Container>
    );
  }

  if (!currentUser) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Please sign in to view your dashboard.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="My Apps" />
          <Tab label="Workflows" />
          <Tab label="Recommendations" />
          <Tab label="Integrations" />
        </Tabs>
      </Box>

      {currentTab === 0 && (
        <AppList
          apps={apps}
          onAddClick={() => setOpenAddDialog(true)}
          onDeleteApp={deleteApp}
        />
      )}

      {currentTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <WorkflowBuilder apps={apps} />
          </Grid>
          <Grid item xs={12}>
            <WorkflowList />
          </Grid>
        </Grid>
      )}

      {currentTab === 2 && (
        <Recommendations onAddApp={handleAddApp} />
      )}

      {currentTab === 3 && (
        <IntegrationCenter />
      )}

      <AddAppDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        onAdd={handleAddApp}
      />
    </Container>
  );
}
