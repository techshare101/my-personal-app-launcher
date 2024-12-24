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
  const [customIntegrations, setCustomIntegrations] = useState([]);
  const [addCustomOpen, setAddCustomOpen] = useState(false);
  const [customIntegration, setCustomIntegration] = useState({
    name: '',
    description: '',
    category: '',
    apiEndpoint: '',
    apiKey: '',
    webhookUrl: '',
    icon: '🔌'
  });

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

  const handleCustomChange = (field) => (event) => {
    setCustomIntegration(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleAddCustom = () => {
    const newIntegration = {
      ...customIntegration,
      id: `custom-${Date.now()}`,
      status: 'available',
      popular: false,
      isCustom: true
    };
    setCustomIntegrations(prev => [...prev, newIntegration]);
    setAddCustomOpen(false);
    setCustomIntegration({
      name: '',
      description: '',
      category: '',
      apiEndpoint: '',
      apiKey: '',
      webhookUrl: '',
      icon: '🔌'
    });
  };

  const allIntegrations = [...INTEGRATIONS, ...customIntegrations];

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" gutterBottom>
            Integration Center
          </Typography>
          <Typography color="text.secondary">
            Connect your favorite tools and services to enhance your workflow
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddCustomOpen(true)}
        >
          Add Custom Integration
        </Button>
      </Box>

      <Grid container spacing={3}>
        {allIntegrations.map((integration) => (
          <Grid item xs={12} sm={6} md={4} key={integration.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
              }}
            >
              {integration.isCustom && (
                <Chip
                  label="Custom"
                  size="small"
                  color="secondary"
                  sx={{ position: 'absolute', top: 8, right: 8 }}
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
                {integration.popular && (
                  <Chip
                    label="Popular"
                    size="small"
                    color="primary"
                  />
                )}
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
                  </>
                ) : (
                  <Button
                    size="small"
                    startIcon={<LinkIcon />}
                    onClick={() => handleConnect(integration)}
                  >
                    Connect
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Configuration Dialog */}
      <Dialog open={configOpen} onClose={() => setConfigOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Configure {selectedIntegration?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {selectedIntegration?.isCustom ? (
              <>
                <TextField
                  fullWidth
                  label="API Endpoint"
                  value={selectedIntegration?.apiEndpoint || ''}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="API Key"
                  type="password"
                  value={selectedIntegration?.apiKey || ''}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Webhook URL"
                  value={selectedIntegration?.webhookUrl || ''}
                  margin="normal"
                />
              </>
            ) : (
              <Alert severity="info">
                You'll be redirected to {selectedIntegration?.name} to complete the integration setup.
              </Alert>
            )}
            {connecting && <LinearProgress sx={{ mt: 2 }} />}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfigSubmit}
            variant="contained"
            disabled={connecting}
          >
            {connecting ? 'Connecting...' : 'Connect'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Custom Integration Dialog */}
      <Dialog open={addCustomOpen} onClose={() => setAddCustomOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Custom Integration</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Integration Name"
              value={customIntegration.name}
              onChange={handleCustomChange('name')}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={customIntegration.description}
              onChange={handleCustomChange('description')}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Category"
              value={customIntegration.category}
              onChange={handleCustomChange('category')}
              fullWidth
            />
            <TextField
              label="API Endpoint"
              value={customIntegration.apiEndpoint}
              onChange={handleCustomChange('apiEndpoint')}
              fullWidth
              required
              helperText="The base URL for your API"
            />
            <TextField
              label="API Key"
              value={customIntegration.apiKey}
              onChange={handleCustomChange('apiKey')}
              fullWidth
              type="password"
              helperText="Your API authentication key"
            />
            <TextField
              label="Webhook URL"
              value={customIntegration.webhookUrl}
              onChange={handleCustomChange('webhookUrl')}
              fullWidth
              helperText="URL for receiving webhooks (optional)"
            />
            <TextField
              label="Icon Emoji"
              value={customIntegration.icon}
              onChange={handleCustomChange('icon')}
              fullWidth
              helperText="Enter an emoji to represent your integration"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddCustomOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddCustom}
            variant="contained"
            disabled={!customIntegration.name || !customIntegration.apiEndpoint}
          >
            Add Integration
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
