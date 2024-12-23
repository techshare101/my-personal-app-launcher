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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useIntegrations } from '../hooks/useIntegrations';
import IntegrationDialog from './IntegrationDialog';
import { INTEGRATION_TEMPLATES, PLATFORMS } from '../services/integrationService';

export default function IntegrationCenter() {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
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

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Integration Templates
        </Typography>
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
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    {template.platforms.map(platform => {
                      const platformInfo = PLATFORMS[platform];
                      return platformInfo ? (
                        <Chip
                          key={platform}
                          label={platformInfo.name}
                          size="small"
                        />
                      ) : null;
                    })}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setSelectedTemplate(template);
                      setOpenDialog(true);
                    }}
                  >
                    Create
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Active Integrations
        </Typography>
        <Grid container spacing={3}>
          {integrations?.map((integration) => (
            <Grid item key={integration.id} xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {INTEGRATION_TEMPLATES[integration.templateId]?.name || 'Unknown Integration'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Status: {integration.status}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton
                    size="small"
                    onClick={() => handleTestIntegration(integration.id)}
                    title="Test Integration"
                  >
                    <PlayArrowIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteIntegration(integration.id)}
                    title="Delete Integration"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <IntegrationDialog
        open={openDialog}
        template={selectedTemplate}
        onClose={() => {
          setOpenDialog(false);
          setSelectedTemplate(null);
        }}
        onSave={handleCreateIntegration}
      />
    </Box>
  );
}
