import React, { useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import AppList from '../components/AppList';
import AppSearch from '../components/AppSearch';
import AppInsights from '../components/AppInsights';
import AddAppDialog from '../components/AddAppDialog';
import WorkflowBuilder from '../components/WorkflowBuilder';
import WorkflowList from '../components/WorkflowList';
import Recommendations from '../components/Recommendations';
import IntegrationCenter from '../components/IntegrationCenter';
import { useFirestore } from '../hooks/useFirestore';
import { analyticsService } from '../services/analyticsService';
import { useAuth } from '../contexts/AuthContext';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Dashboard() {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { apps, loading, error, saveApp, deleteApp } = useFirestore();
  const { currentUser } = useAuth();

  // Filter apps based on search query and category
  const filteredApps = useMemo(() => {
    return apps.filter(app => {
      const matchesSearch = searchQuery === '' || 
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === '' || 
        app.category?.toLowerCase() === selectedCategory.toLowerCase();
      
      return matchesSearch && matchesCategory;
    });
  }, [apps, searchQuery, selectedCategory]);

  const handleAddClick = () => {
    setOpenAddDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenAddDialog(false);
  };

  const handleSaveApp = async (appData) => {
    try {
      await saveApp(appData);
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving app:', err);
    }
  };

  const handleDeleteApp = async (appId) => {
    try {
      await deleteApp(appId);
    } catch (err) {
      console.error('Error deleting app:', err);
    }
  };

  const handleAppLaunch = async (app) => {
    try {
      const sessionId = await analyticsService.trackAppLaunch(currentUser.uid, app.id, app);
      window.open(app.url, '_blank');
      
      // Simulate app usage time for demo purposes
      // In a real app, you'd track actual usage time
      setTimeout(() => {
        analyticsService.trackAppClose(currentUser.uid, sessionId, Math.random() * 30);
      }, 1000);
    } catch (err) {
      console.error('Error tracking app launch:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          Error loading apps: {error}
        </Alert>
      </Container>
    );
  }

  if (!currentUser) {
    return (
      <Container>
        <Alert severity="info" sx={{ mt: 2 }}>
          Please sign in to view your dashboard.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
          <Tab label="My Apps" />
          <Tab label="Workflows" />
          <Tab label="Insights" />
          <Tab label="Recommendations" />
          <Tab label="Integrations" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <AppSearch
          searchQuery={searchQuery}
          category={selectedCategory}
          onSearchChange={setSearchQuery}
          onCategoryChange={setSelectedCategory}
        />
        <AppList
          apps={filteredApps}
          onAddClick={handleAddClick}
          onDeleteApp={handleDeleteApp}
          onLaunchApp={handleAppLaunch}
          onSelectApp={setSelectedApp}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <WorkflowBuilder apps={apps} />
          </Grid>
          <Grid item xs={12}>
            <WorkflowList />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <AppInsights selectedApp={selectedApp} />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Recommendations onAddApp={handleSaveApp} />
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <IntegrationCenter />
      </TabPanel>

      <AddAppDialog
        open={openAddDialog}
        onClose={handleCloseDialog}
        onAdd={handleSaveApp}
      />
    </Container>
  );
}
