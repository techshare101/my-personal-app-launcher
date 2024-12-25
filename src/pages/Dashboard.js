import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Tab,
  Tabs,
  Typography,
  Paper,
  Button,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AppList from '../components/AppList';
import AppSearch from '../components/AppSearch';
import AddAppDialog from '../components/AddAppDialog';
import AppInsights from '../components/AppInsights';
import Recommendations from '../components/Recommendations';
import WorkflowBuilder from '../components/WorkflowBuilder';
import IntegrationCenter from '../components/IntegrationCenter';
import { useFirestore } from '../hooks/useFirestore';
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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { apps, loading, error, saveApp, deleteApp } = useFirestore();
  const { currentUser } = useAuth();

  // Filter apps based on search query and category
  const filteredApps = useMemo(() => {
    return apps.filter(app => {
      const matchesSearch = !searchQuery || 
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || 
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

  const handleAddApp = async (appData) => {
    try {
      // Convert the app data to the format expected by Firestore
      const appToSave = {
        name: appData.name,
        description: appData.description,
        category: 'recommended', // Default category for recommended apps
        addedAt: new Date().toISOString(),
        userId: currentUser?.uid,
        status: 'active'
      };

      await saveApp(appToSave);
      setOpenAddDialog(false);
    } catch (error) {
      console.error('Error adding app:', error);
    }
  };

  const handleDeleteApp = async (appId) => {
    try {
      await deleteApp(appId);
    } catch (error) {
      console.error('Error deleting app:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAppSelect = (app) => {
    setSelectedApp(app);
  };

  const handleAppLaunch = (app) => {
    window.open(app.url, '_blank');
  };

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Error loading apps: {error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab label="My Apps" />
          <Tab label="Workflows" />
          <Tab label="Recommendations" />
          <Tab label="Insights" />
          <Tab label="Integrations" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 3 }}>
          <AppSearch
            onSearch={setSearchQuery}
            onCategoryChange={setSelectedCategory}
          />
        </Box>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddDialog(true)}
          >
            Add App
          </Button>
        </Box>
        <AppList
          apps={filteredApps}
          loading={loading}
          onSelect={handleAppSelect}
          onLaunch={handleAppLaunch}
          onDeleteApp={handleDeleteApp}
          onAddClick={handleAddClick}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <WorkflowBuilder apps={apps} currentUser={currentUser} />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Recommendations onAddApp={handleAddApp} />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <AppInsights selectedApp={selectedApp} apps={apps} />
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <IntegrationCenter />
      </TabPanel>

      <AddAppDialog
        open={openAddDialog}
        onClose={handleCloseDialog}
        onAdd={handleAddApp}
      />
    </Container>
  );
}
