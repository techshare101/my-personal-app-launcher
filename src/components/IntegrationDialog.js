import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Autocomplete,
  Chip,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { PLATFORMS } from '../services/integrationService';

const steps = ['Select Apps', 'Configure Connection', 'Review'];

const defaultConfigFields = {
  'slack-notion': [
    { name: 'slackChannel', label: 'Slack Channel', type: 'text' },
    { name: 'notionPageId', label: 'Notion Page ID', type: 'text' }
  ],
  'calendar-todo': [
    { name: 'calendarId', label: 'Calendar ID', type: 'text' },
    { name: 'todoListId', label: 'Todo List ID', type: 'text' }
  ],
  'email-to-slack': [
    { name: 'emailFilter', label: 'Email Filter', type: 'text' },
    { name: 'slackChannel', label: 'Slack Channel', type: 'text' }
  ],
  'drive-backup': [
    { name: 'sourceFolderId', label: 'Source Folder ID', type: 'text' },
    { name: 'destinationFolderId', label: 'Destination Folder ID', type: 'text' }
  ],
  'github-notion': [
    { name: 'repositoryUrl', label: 'GitHub Repository URL', type: 'text' },
    { name: 'notionDatabaseId', label: 'Notion Database ID', type: 'text' }
  ],
  'trello-asana': [
    { name: 'trelloBoardId', label: 'Trello Board ID', type: 'text' },
    { name: 'asanaProjectId', label: 'Asana Project ID', type: 'text' }
  ]
};

export default function IntegrationDialog({ open, onClose, template, onSubmit }) {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [isCustom, setIsCustom] = useState(false);

  useEffect(() => {
    if (template) {
      setIsCustom(template.id === 'custom');
      setFormData({
        name: template.name || '',
        description: template.description || '',
        type: template.type || 'personal',
        category: template.category || 'integrations'
      });
      setSelectedPlatforms(template.platforms || []);
    }
  }, [template]);

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSave();
    } else {
      if (activeStep === 0 && selectedPlatforms.length < 2) {
        setError('Please select at least 2 apps to connect');
        return;
      }
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSave = () => {
    try {
      if (isCustom) {
        if (!formData.name || !formData.description) {
          setError('Please provide a name and description for your integration');
          return;
        }
      }

      const configFields = isCustom ? 
        selectedPlatforms.map(p => ({ name: p + 'Config', label: PLATFORMS[p].name + ' Configuration', type: 'text' })) :
        defaultConfigFields[template.id] || [];

      const missingFields = configFields
        .filter(field => !formData[field.name])
        .map(field => field.label);

      if (missingFields.length > 0) {
        setError(`Please fill in the following fields: ${missingFields.join(', ')}`);
        return;
      }

      onSubmit({
        ...formData,
        templateId: isCustom ? 'custom' : template.id,
        platforms: selectedPlatforms,
        status: 'pending',
        isCustom: isCustom
      });
      handleReset();
    } catch (err) {
      setError('Failed to create integration. Please try again.');
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setFormData({});
    setError(null);
    setSelectedPlatforms([]);
    setIsCustom(false);
    onClose();
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handlePlatformSelect = (event, newValue) => {
    setSelectedPlatforms(newValue);
    setError(null);
  };

  const getStepContent = (step) => {
    if (!template) return null;

    switch (step) {
      case 0:
        return (
          <Box>
            {isCustom ? (
              <>
                <Typography gutterBottom>
                  Create your custom integration by selecting the apps you want to connect:
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Autocomplete
                    multiple
                    options={Object.keys(PLATFORMS)}
                    value={selectedPlatforms}
                    onChange={handlePlatformSelect}
                    getOptionLabel={(option) => PLATFORMS[option].name}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Apps"
                        placeholder="Add more apps..."
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          key={option}
                          label={PLATFORMS[option].name}
                          {...getTagProps({ index })}
                          sx={{
                            backgroundColor: PLATFORMS[option].color,
                            color: 'white',
                          }}
                        />
                      ))
                    }
                  />
                </Box>
                <Box sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    label="Integration Name"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleFieldChange}
                    required
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleFieldChange}
                    required
                    multiline
                    rows={2}
                  />
                </Box>
              </>
            ) : (
              <>
                <Typography gutterBottom>
                  This integration will connect:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                  {template.platforms.map((platform) => {
                    const platformInfo = PLATFORMS[platform];
                    return platformInfo ? (
                      <Box
                        key={platform}
                        sx={{
                          p: 2,
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            color: platformInfo.color
                          }}
                        >
                          {platformInfo.name}
                        </Typography>
                      </Box>
                    ) : null;
                  })}
                </Box>
              </>
            )}
          </Box>
        );
      
      case 1:
        const configFields = isCustom ?
          selectedPlatforms.map(p => ({ name: p + 'Config', label: PLATFORMS[p].name + ' Configuration', type: 'text' })) :
          defaultConfigFields[template.id] || [];

        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {configFields.map((field) => (
              <TextField
                key={field.name}
                name={field.name}
                label={field.label}
                type={field.type}
                value={formData[field.name] || ''}
                onChange={handleFieldChange}
                fullWidth
                required
              />
            ))}
          </Box>
        );
      
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Integration Settings
            </Typography>
            <Box sx={{ mt: 2 }}>
              {Object.entries(formData).map(([key, value]) => (
                <Box key={key} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {key.charAt(0).toUpperCase() + key.slice(1)}:
                  </Typography>
                  <Typography>{value}</Typography>
                </Box>
              ))}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Connected Apps:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {selectedPlatforms.map((platform) => (
                    <Chip
                      key={platform}
                      label={PLATFORMS[platform].name}
                      sx={{
                        backgroundColor: PLATFORMS[platform].color,
                        color: 'white',
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        );
      
      default:
        return 'Unknown step';
    }
  };

  if (!template) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {isCustom ? 'Create Custom Integration' : `Create Integration: ${template.name}`}
      </DialogTitle>
      
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {getStepContent(activeStep)}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleReset}>Cancel</Button>
        <Box sx={{ flex: '1 1 auto' }} />
        {activeStep !== 0 && (
          <Button onClick={handleBack}>
            Back
          </Button>
        )}
        <Button
          variant="contained"
          onClick={handleNext}
        >
          {activeStep === steps.length - 1 ? 'Create Integration' : 'Next'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
