import React, { useState } from 'react';
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
} from '@mui/material';

const steps = ['Select Platforms', 'Configure Settings', 'Review'];

export default function IntegrationDialog({ open, onClose, template, onSave }) {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({});

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSave();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSave = () => {
    onSave({
      templateId: template.id,
      ...formData
    });
    handleReset();
  };

  const handleReset = () => {
    setActiveStep(0);
    setFormData({});
    onClose();
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography gutterBottom>
              This integration will connect:
            </Typography>
            {template?.platforms.map((platform, index) => (
              <Typography key={platform} variant="body1" sx={{ ml: 2 }}>
                {index + 1}. {platform}
              </Typography>
            ))}
          </Box>
        );
      
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {template?.configFields.map((field) => (
              <TextField
                key={field.name}
                name={field.name}
                label={field.label}
                type={field.type}
                value={formData[field.name] || ''}
                onChange={handleFieldChange}
                fullWidth
                required={!field.label.includes('optional')}
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
            {Object.entries(formData).map(([key, value]) => (
              <Box key={key} sx={{ mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {key}:
                </Typography>
                <Typography>{value}</Typography>
              </Box>
            ))}
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
        Create Integration: {template.name}
      </DialogTitle>
      
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
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
