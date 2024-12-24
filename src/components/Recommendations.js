import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Tooltip,
  Collapse,
  Button,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  Recommend as RecommendIcon,
  AccessTime as AccessTimeIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  PlayArrow as PlayArrowIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useRecommendations } from '../hooks/useRecommendations';
import { useState } from 'react';

export default function Recommendations({ onAddApp }) {
  const {
    recommendations,
    timeSuggestions,
    loading,
    error,
    refreshRecommendations
  } = useRecommendations();

  const [expandedApp, setExpandedApp] = useState(null);
  const [expandedSuggestion, setExpandedSuggestion] = useState(null);
  const [workflowDialog, setWorkflowDialog] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

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
        Error loading recommendations: {error}
      </Alert>
    );
  }

  const handleExpandApp = (index) => {
    setExpandedApp(expandedApp === index ? null : index);
  };

  const handleExpandSuggestion = (index) => {
    setExpandedSuggestion(expandedSuggestion === index ? null : index);
  };

  const handleStartWorkflow = (suggestion) => {
    setActiveWorkflow(suggestion);
    setActiveStep(0);
    setWorkflowDialog(true);
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleCloseWorkflow = () => {
    setWorkflowDialog(false);
    setActiveWorkflow(null);
    setActiveStep(0);
  };

  const WorkflowDialog = () => {
    if (!activeWorkflow) return null;

    const steps = activeWorkflow.potentialWorkflow.steps;
    const isLastStep = activeStep === steps.length - 1;

    return (
      <Dialog
        open={workflowDialog}
        onClose={handleCloseWorkflow}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              Workflow Guide: {activeWorkflow.appId}
            </Typography>
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleCloseWorkflow}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={index}>
                <StepLabel>Step {index + 1}</StepLabel>
                <StepContent>
                  <Typography>{step}</Typography>
                  <Box sx={{ mb: 2, mt: 1 }}>
                    <div>
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        {isLastStep ? 'Finish' : 'Continue'}
                      </Button>
                      <Button
                        disabled={index === 0}
                        onClick={handleBack}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Back
                      </Button>
                    </div>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
          {activeStep === steps.length && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Workflow completed!
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {activeWorkflow.potentialWorkflow.expectedOutcome}
              </Typography>
              <Button onClick={handleCloseWorkflow} sx={{ mt: 1 }}>
                Close
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ flex: 1 }}>
          Recommended for You
        </Typography>
        <Tooltip title="Refresh recommendations">
          <IconButton onClick={refreshRecommendations} size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* New App Recommendations */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <RecommendIcon sx={{ mr: 1 }} color="primary" />
            <Typography variant="h6">
              Suggested Apps
            </Typography>
          </Box>
          <List>
            {recommendations.map((app, index) => (
              <React.Fragment key={index}>
                <ListItem
                  alignItems="flex-start"
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => onAddApp({
                        name: app.name,
                        url: app.url,
                        category: app.category,
                        description: app.description
                      })}
                    >
                      <AddIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle1" component="span">
                          {app.name}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleExpandApp(index)}
                          sx={{ ml: 1 }}
                        >
                          {expandedApp === index ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {app.description}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                          <Chip
                            label={app.category}
                            size="small"
                            color="default"
                          />
                          <Chip
                            label={app.priority}
                            size="small"
                            color={
                              app.priority === 'high' ? 'error' :
                              app.priority === 'medium' ? 'warning' : 'default'
                            }
                          />
                          <Chip
                            label={`${Math.round(app.relevance.score * 100)}% match`}
                            size="small"
                            color="success"
                          />
                        </Stack>
                      </Box>
                    }
                  />
                </ListItem>
                <Collapse in={expandedApp === index}>
                  <Box sx={{ pl: 4, pr: 2, pb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Key Features
                    </Typography>
                    <List dense>
                      {app.features.map((feature, idx) => (
                        <ListItem key={idx} dense>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircleIcon fontSize="small" color="success" />
                          </ListItemIcon>
                          <ListItemText primary={feature} />
                        </ListItem>
                      ))}
                    </List>

                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                      Integrations
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      {app.integrations.map((integration, idx) => (
                        <Chip
                          key={idx}
                          label={integration}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Stack>

                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                      Why This App?
                    </Typography>
                    <List dense>
                      {app.relevance.factors.map((factor, idx) => (
                        <ListItem key={idx} dense>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <InfoIcon fontSize="small" color="info" />
                          </ListItemIcon>
                          <ListItemText primary={factor} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Collapse>
                {index < recommendations.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Time-based Suggestions */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AccessTimeIcon sx={{ mr: 1 }} color="primary" />
            <Typography variant="h6">
              Relevant Right Now
            </Typography>
          </Box>
          <List>
            {timeSuggestions.map((suggestion, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle1" component="span">
                          {suggestion.appId}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleExpandSuggestion(index)}
                          sx={{ ml: 1 }}
                        >
                          {expandedSuggestion === index ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {suggestion.reason}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={`${Math.round(suggestion.relevanceScore * 100)}% relevant`}
                            size="small"
                            color="primary"
                          />
                          <Button
                            size="small"
                            startIcon={<PlayArrowIcon />}
                            variant="outlined"
                            onClick={() => handleStartWorkflow(suggestion)}
                          >
                            Start Workflow
                          </Button>
                        </Stack>
                      </Box>
                    }
                  />
                </ListItem>
                <Collapse in={expandedSuggestion === index}>
                  <Box sx={{ pl: 4, pr: 2, pb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Suggested Workflow
                    </Typography>
                    <List dense>
                      {suggestion.potentialWorkflow.steps.map((step, idx) => (
                        <ListItem key={idx} dense>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <Typography variant="caption" color="text.secondary">
                              {idx + 1}.
                            </Typography>
                          </ListItemIcon>
                          <ListItemText primary={step} />
                        </ListItem>
                      ))}
                    </List>

                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                      Expected Outcome
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {suggestion.potentialWorkflow.expectedOutcome}
                    </Typography>

                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                      Context Factors
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                      {suggestion.contextFactors.map((factor, idx) => (
                        <Chip
                          key={idx}
                          label={factor}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </Box>
                </Collapse>
                {index < timeSuggestions.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Workflow Dialog */}
      <WorkflowDialog />
    </Box>
  );
}
