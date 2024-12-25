import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SaveIcon from '@mui/icons-material/Save';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { analyticsService } from '../services/analyticsService';

const SortableItem = ({ id, app, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        cursor: 'grab',
        '&:hover': {
          bgcolor: 'action.hover',
        },
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        mb: 1,
      }}
    >
      <ListItemText
        primary={app.name}
        secondary={app.description}
      />
      <ListItemSecondaryAction>
        <IconButton
          edge="end"
          onClick={() => onDelete(id)}
          sx={{ mr: 1 }}
        >
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default function WorkflowBuilder({ apps, onSave }) {
  const [workflow, setWorkflow] = useState({ name: '', steps: [] });
  const [error, setError] = useState('');
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setWorkflow((workflow) => {
        const oldIndex = workflow.steps.findIndex((step) => step.id === active.id);
        const newIndex = workflow.steps.findIndex((step) => step.id === over.id);

        return {
          ...workflow,
          steps: arrayMove(workflow.steps, oldIndex, newIndex),
        };
      });
    }
  }, []);

  const handleAddStep = () => {
    if (!selectedApp) return;

    const newStep = {
      id: `step-${Date.now()}`,
      appId: selectedApp.id,
      name: selectedApp.name,
      description: selectedApp.description,
    };

    setWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));

    setSelectedApp(null);
    setIsAddingStep(false);
  };

  const handleDeleteStep = (stepId) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId),
    }));
  };

  const handleSave = async () => {
    try {
      if (!workflow.name.trim()) {
        throw new Error('Please enter a workflow name');
      }
      if (workflow.steps.length === 0) {
        throw new Error('Please add at least one step to the workflow');
      }

      await onSave(workflow);
      setWorkflow({ name: '', steps: [] });
      setError('');

      // Track workflow creation
      analyticsService.trackEvent('workflow_created', {
        name: workflow.name,
        stepsCount: workflow.steps.length,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRunWorkflow = async () => {
    try {
      // Track workflow execution
      analyticsService.trackEvent('workflow_executed', {
        name: workflow.name,
        stepsCount: workflow.steps.length,
      });

      // Execute each step in sequence
      for (const step of workflow.steps) {
        const app = apps.find(a => a.id === step.appId);
        if (app?.url) {
          // Add protocol if missing
          let url = app.url;
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
          }
          
          // Open in new tab
          window.open(url, '_blank', 'noopener,noreferrer');
          
          // Add delay between steps
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (err) {
      setError('Failed to run workflow: ' + err.message);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Create Workflow
          </Typography>

          <TextField
            fullWidth
            label="Workflow Name"
            value={workflow.name}
            onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
            margin="normal"
          />

          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Steps
            </Typography>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={workflow.steps.map(step => step.id)}
                strategy={verticalListSortingStrategy}
              >
                <List>
                  {workflow.steps.map((step) => (
                    <SortableItem
                      key={step.id}
                      id={step.id}
                      app={step}
                      onDelete={handleDeleteStep}
                    />
                  ))}
                </List>
              </SortableContext>
            </DndContext>

            <Button
              startIcon={<AddIcon />}
              onClick={() => setIsAddingStep(true)}
              sx={{ mt: 2 }}
            >
              Add Step
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!workflow.name || workflow.steps.length === 0}
            >
              Save Workflow
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<PlayArrowIcon />}
              onClick={handleRunWorkflow}
              disabled={workflow.steps.length === 0}
            >
              Run Workflow
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Add Step Dialog */}
      <Dialog open={isAddingStep} onClose={() => setIsAddingStep(false)}>
        <DialogTitle>Add Step</DialogTitle>
        <DialogContent>
          <List>
            {apps.map((app) => (
              <ListItem
                key={app.id}
                button
                onClick={() => setSelectedApp(app)}
                selected={selectedApp?.id === app.id}
              >
                <ListItemText
                  primary={app.name}
                  secondary={app.description}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddingStep(false)}>Cancel</Button>
          <Button
            onClick={handleAddStep}
            disabled={!selectedApp}
            variant="contained"
            color="primary"
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
