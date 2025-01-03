import React, { useState } from 'react';
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
} from '@dnd-kit/sortable';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import { useWorkflows } from '../hooks/useWorkflows';
import SortableAppItem from './SortableAppItem';

export default function WorkflowBuilder({ apps }) {
  const [workflowName, setWorkflowName] = useState('');
  const [selectedApps, setSelectedApps] = useState([]);
  const { saveWorkflow } = useWorkflows();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSelectedApps((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddApp = (app) => {
    if (!selectedApps.find(selected => selected.id === app.id)) {
      setSelectedApps([...selectedApps, app]);
    }
  };

  const handleRemoveApp = (appId) => {
    setSelectedApps(selectedApps.filter(app => app.id !== appId));
  };

  const handleSaveWorkflow = async () => {
    if (!workflowName.trim()) {
      alert('Please enter a workflow name');
      return;
    }

    if (selectedApps.length === 0) {
      alert('Please add at least one app to the workflow');
      return;
    }

    try {
      // Validate that all apps have either a path or URL
      const invalidApps = selectedApps.filter(app => {
        if (app.isWebApp) {
          return !app.url; // Web apps must have URL
        }
        return !app.path && !app.url; // Other apps must have either path or URL
      });

      if (invalidApps.length > 0) {
        const invalidAppNames = invalidApps.map(app => app.name).join(', ');
        throw new Error(`Missing configuration for apps: ${invalidAppNames}. Web apps must have URLs, desktop apps must have paths.`);
      }

      // Clean up app data to prevent undefined values
      const cleanedApps = selectedApps.map((app, index) => {
        const cleanApp = {
          id: app.id || `app-${index}`,
          name: app.name || 'Unnamed App',
          category: app.category || 'unknown',
          description: app.description || `${app.name || 'Unnamed'} application`,
          isWebApp: app.isWebApp || (!app.path && app.url) || false,
          delay: index === 0 ? 0 : (app.delay || 2000)
        };

        // Only include path if it exists and app is not a web app
        if (app.path && !cleanApp.isWebApp) {
          cleanApp.path = app.path;
        }

        // Only include URL if it exists
        if (app.url) {
          cleanApp.url = app.url;
        }

        // Include thumbnail if it exists
        if (app.thumbnail) {
          cleanApp.thumbnail = app.thumbnail;
        }

        return cleanApp;
      });

      const workflowData = {
        name: workflowName.trim(),
        apps: cleanedApps,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Saving workflow:', workflowData);
      await saveWorkflow(workflowData);
      
      // Clear form after successful save
      setWorkflowName('');
      setSelectedApps([]);
      
      // Show success message
      alert('Workflow saved successfully!');
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert(error.message || 'Failed to save workflow. Please try again.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Create New Workflow
      </Typography>

      <TextField
        fullWidth
        label="Workflow Name"
        value={workflowName}
        onChange={(e) => setWorkflowName(e.target.value)}
        margin="normal"
      />

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Paper sx={{ flex: 1, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Available Apps
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {apps.map((app) => (
              <Button
                key={app.id}
                variant="outlined"
                onClick={() => handleAddApp(app)}
                disabled={selectedApps.some(selected => selected.id === app.id)}
              >
                {app.name}
              </Button>
            ))}
          </Box>
        </Paper>

        <Paper sx={{ flex: 1, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Workflow Steps
          </Typography>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={selectedApps}
              strategy={verticalListSortingStrategy}
            >
              {selectedApps.map((app) => (
                <SortableAppItem
                  key={app.id}
                  app={app}
                  onRemove={() => handleRemoveApp(app.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </Paper>
      </Box>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveWorkflow}
          disabled={!workflowName.trim() || selectedApps.length === 0}
        >
          Save Workflow
        </Button>
      </Box>
    </Box>
  );
}
