import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useIntegrations } from '../hooks/useIntegrations';
import IntegrationDialog from './IntegrationDialog';
import { INTEGRATION_TEMPLATES, PLATFORMS } from '../services/integrationService';

const CUSTOM_TEMPLATE = {
  id: 'custom',
  name: 'Custom Integration',
  description: 'Create your own custom integration by mixing and matching apps',
  platforms: [],
  type: 'personal',
  category: 'integrations'
};

export default function IntegrationCenter() {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const {
    integrations,
    loading,
    error,
    createIntegration,
    testIntegration,
    deleteIntegration
  } = useIntegrations();

  const handleCreateIntegration = async (integrationData) => {
    try {
      await createIntegration(integrationData);
      setOpenDialog(false);
    } catch (err) {
      console.error('Error creating integration:', err);
    }
  };

  const handleTestIntegration = async (integrationId) => {
    try {
      await testIntegration(integrationId);
      // Show success message
    } catch (err) {
      console.error('Error testing integration:', err);
      // Show error message
    }
  };

  const handleDeleteIntegration = async (integrationId) => {
    try {
      await deleteIntegration(integrationId);
    } catch (err) {
      console.error('Error deleting integration:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading integrations: {error}
      </Alert>
    );
  }

  const personalTemplates = Object.values(INTEGRATION_TEMPLATES).filter(
    template => template.type === 'personal'
  );

  const activeIntegrations = integrations || [];

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="Templates" />
          <Tab label="Active Integrations" />
          <Tab label="Personal Integrations" />
        </Tabs>
      </Box>

      {currentTab === 0 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Integration Templates
          </Typography>
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedTemplate(CUSTOM_TEMPLATE);
                setOpenDialog(true);
              }}
            >
              Create Custom Integration
            </Button>
          </Box>
          <Grid container spacing={3}>
            {Object.values(INTEGRATION_TEMPLATES).map((template) => (
              <Grid item key={template.id} xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {template.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {template.description}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {template.platforms.map(platform => {
                        const platformInfo = PLATFORMS[platform];
                        return platformInfo ? (
                          <Chip
                            key={platform}
                            label={platformInfo.name}
                            size="small"
                            sx={{
                              backgroundColor: platformInfo.color,
                              color: 'white',
                            }}
                          />
                        ) : null;
                      })}
                      <Chip
                        label={template.type}
                        size="small"
                        color={template.type === 'personal' ? 'primary' : 'default'}
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setOpenDialog(true);
                      }}
                    >
                      Create Integration
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {currentTab === 1 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Active Integrations
          </Typography>
          <Grid container spacing={3}>
            {activeIntegrations.map((integration) => (
              <Grid item key={integration.id} xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {integration.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {integration.description}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Chip
                        label={integration.status}
                        color={integration.status === 'active' ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <IconButton
                      size="small"
                      onClick={() => handleTestIntegration(integration.id)}
                      color="primary"
                    >
                      <PlayArrowIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteIntegration(integration.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {currentTab === 2 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Personal Integrations
          </Typography>
          <Grid container spacing={3}>
            {personalTemplates.map((template) => (
              <Grid item key={template.id} xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {template.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {template.description}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {template.platforms.map(platform => {
                        const platformInfo = PLATFORMS[platform];
                        return platformInfo ? (
                          <Chip
                            key={platform}
                            label={platformInfo.name}
                            size="small"
                            sx={{
                              backgroundColor: platformInfo.color,
                              color: 'white',
                            }}
                          />
                        ) : null;
                      })}
                      <Chip
                        label={template.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setOpenDialog(true);
                      }}
                    >
                      Create Integration
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <IntegrationDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        template={selectedTemplate}
        onSubmit={handleCreateIntegration}
      />
    </Box>
  );
}
