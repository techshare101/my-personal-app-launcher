import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Check as CheckIcon,
  Settings as SettingsIcon,
  Link as LinkIcon,
  CloudSync as CloudSyncIcon,
} from '@mui/icons-material';

const INTEGRATIONS = [
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect your apps with thousands of automated workflows',
    icon: '🔄',
    category: 'Automation',
    status: 'available',
    popular: true,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send notifications and updates to your Slack channels',
    icon: '💬',
    category: 'Communication',
    status: 'available',
    popular: true,
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Sync with GitHub repositories and track development tasks',
    icon: '🐙',
    category: 'Development',
    status: 'available',
    popular: true,
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Connect with Notion workspaces for documentation and notes',
    icon: '📝',
    category: 'Productivity',
    status: 'available',
    popular: true,
  },
  {
    id: 'microsoft365',
    name: 'Microsoft 365',
    description: 'Integrate with Microsoft Office apps and services',
    icon: '📊',
    category: 'Productivity',
    status: 'available',
    popular: true,
  },
  {
    id: 'google-workspace',
    name: 'Google Workspace',
    description: 'Connect with Google Drive, Calendar, and other Google services',
    icon: '🔄',
    category: 'Productivity',
    status: 'available',
    popular: true,
  },
  {
    id: 'trello',
    name: 'Trello',
    description: 'Sync tasks and boards with Trello',
    icon: '📋',
    category: 'Project Management',
    status: 'available',
    popular: true,
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Track issues and projects with Jira integration',
    icon: '🎯',
    category: 'Project Management',
    status: 'available',
    popular: true,
  },
  {
    id: 'asana',
    name: 'Asana',
    description: 'Manage tasks and projects with Asana integration',
    icon: '✅',
    category: 'Project Management',
    status: 'available',
    popular: true,
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Sync files and folders with Dropbox',
    icon: '📦',
    category: 'Storage',
    status: 'available',
    popular: true,
  },
  {
    id: 'zoom',
    name: 'Zoom',
    description: 'Schedule and manage Zoom meetings',
    icon: '🎥',
    category: 'Communication',
    status: 'available',
    popular: true,
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Send notifications and updates to Discord channels',
    icon: '🎮',
    category: 'Communication',
    status: 'available',
    popular: true,
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Sync customer data with Salesforce CRM',
    icon: '💼',
    category: 'Business',
    status: 'available',
    popular: true,
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Integrate with HubSpot CRM and marketing tools',
    icon: '📈',
    category: 'Business',
    status: 'available',
    popular: true,
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Track software development with Linear',
    icon: '⚡',
    category: 'Development',
    status: 'available',
    popular: true,
  }
];

export default function IntegrationCenter() {
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectedApps, setConnectedApps] = useState([]);

  const handleConnect = async (integration) => {
    setSelectedIntegration(integration);
    setConfigOpen(true);
  };

  const handleDisconnect = (integrationId) => {
    setConnectedApps(prev => prev.filter(id => id !== integrationId));
  };

  const handleConfigSubmit = async () => {
    setConnecting(true);
    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 1500));
    setConnectedApps(prev => [...prev, selectedIntegration.id]);
    setConnecting(false);
    setConfigOpen(false);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Integration Center
        </Typography>
        <Typography color="text.secondary">
          Connect your favorite tools and services to enhance your workflow
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {INTEGRATIONS.map((integration) => (
          <Grid item xs={12} sm={6} md={4} key={integration.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                '&:hover': {
                  boxShadow: 3,
                }
              }}
            >
              {integration.popular && (
                <Chip
                  label="Popular"
                  color="primary"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                  }}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h3" component="span" sx={{ mr: 1 }}>
                    {integration.icon}
                  </Typography>
                  <Typography variant="h6" component="h2">
                    {integration.name}
                  </Typography>
                </Box>
                <Typography color="text.secondary" paragraph>
                  {integration.description}
                </Typography>
                <Chip 
                  label={integration.category}
                  size="small"
                  sx={{ mr: 1 }}
                />
              </CardContent>
              <CardActions>
                {connectedApps.includes(integration.id) ? (
                  <>
                    <Button
                      size="small"
                      startIcon={<SettingsIcon />}
                      onClick={() => handleConnect(integration)}
                    >
                      Configure
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDisconnect(integration.id)}
                    >
                      Disconnect
                    </Button>
                    <Tooltip title="Connected">
                      <CheckIcon color="success" sx={{ ml: 'auto' }} />
                    </Tooltip>
                  </>
                ) : (
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => handleConnect(integration)}
                    variant="contained"
                  >
                    Connect
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={configOpen} onClose={() => setConfigOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Configure {selectedIntegration?.name}
        </DialogTitle>
        <DialogContent>
          {connecting ? (
            <Box sx={{ my: 4 }}>
              <Typography align="center" gutterBottom>
                Connecting to {selectedIntegration?.name}...
              </Typography>
              <LinearProgress />
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <TextField
                label="API Key"
                fullWidth
                type="password"
                sx={{ mb: 2 }}
              />
              <TextField
                label="Workspace ID"
                fullWidth
                sx={{ mb: 2 }}
              />
              <Alert severity="info" sx={{ mb: 2 }}>
                You can find these details in your {selectedIntegration?.name} dashboard settings.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigOpen(false)} disabled={connecting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfigSubmit}
            variant="contained"
            disabled={connecting}
            startIcon={<CloudSyncIcon />}
          >
            {connecting ? 'Connecting...' : 'Connect'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
