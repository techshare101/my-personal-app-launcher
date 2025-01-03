import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Paper,
  Box,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteIcon from '@mui/icons-material/Delete';
import { useWorkflows } from '../hooks/useWorkflows';

export default function WorkflowList() {
  const { workflows, deleteWorkflow } = useWorkflows();
  const [runningWorkflows, setRunningWorkflows] = useState(new Set());

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleRunWorkflow = async (workflow) => {
    if (runningWorkflows.has(workflow.id)) {
      return;
    }

    // Check if we're running in Electron
    const isElectron = window.electron !== undefined;
    if (!isElectron) {
      console.error('Not running in Electron environment');
      alert('This app must be run in Electron to launch desktop applications. Please restart using npm run electron-dev');
      return;
    }

    try {
      setRunningWorkflows(prev => new Set([...prev, workflow.id]));

      for (let i = 0; i < workflow.apps.length; i++) {
        const app = workflow.apps[i];
        
        try {
          console.log(`Opening ${app.name}`);
          
          // If it's a web app or has a URL but no path, open in browser
          if (app.isWebApp || (!app.path && app.url)) {
            console.log(`Opening web app in browser: ${app.url}`);
            window.open(app.url, '_blank');
          }
          // If it has a path, try to launch it as a desktop app
          else if (app.path) {
            console.log(`Using executable path: ${app.path}`);
            const success = await window.electron.openApp(app.path);
            if (!success) {
              console.error(`Failed to open ${app.name} with path: ${app.path}`);
              throw new Error(`Failed to open ${app.name}. Please check if the path is correct: ${app.path}`);
            }
          }
          // If neither condition is met, throw error
          else {
            throw new Error(`No path or URL configured for ${app.name}. Please edit the app to add its location.`);
          }
          
          console.log(`Successfully opened ${app.name}`);

          // Wait for the configured delay before opening the next app
          // Skip delay after the last app
          if (i < workflow.apps.length - 1) {
            const delay = app.delay || 2000;
            console.log(`Waiting ${delay}ms before opening next app...`);
            await sleep(delay);
          }

        } catch (error) {
          console.error(`Error opening ${app.name}:`, error);
          // Continue with next app instead of stopping the whole workflow
          alert(`Failed to open ${app.name}: ${error.message}\nContinuing with next app...`);
        }
      }
    } catch (error) {
      console.error('Error running workflow:', error);
      alert(error.message || 'Failed to run workflow. Please try again.');
    } finally {
      setRunningWorkflows(prev => {
        const next = new Set(prev);
        next.delete(workflow.id);
        return next;
      });
    }
  };

  const handleDeleteWorkflow = async (workflowId) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      try {
        await deleteWorkflow(workflowId);
      } catch (error) {
        console.error('Error deleting workflow:', error);
        alert('Failed to delete workflow. Please try again.');
      }
    }
  };

  if (workflows.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body1" color="textSecondary">
          No workflows created yet. Create your first workflow to get started!
        </Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Your Workflows
      </Typography>
      <List>
        {workflows.map((workflow) => (
          <ListItem
            key={workflow.id}
            sx={{
              mb: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            <ListItemText
              primary={workflow.name}
              secondary={
                <Box component="span" sx={{ display: 'block' }}>
                  {workflow.apps.map(app => app.name).join(' → ')}
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <Tooltip title="Run workflow">
                <IconButton
                  edge="end"
                  color="primary"
                  onClick={() => handleRunWorkflow(workflow)}
                  disabled={runningWorkflows.has(workflow.id)}
                  sx={{ mr: 1 }}
                >
                  {runningWorkflows.has(workflow.id) ? (
                    <CircularProgress size={24} />
                  ) : (
                    <PlayArrowIcon />
                  )}
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete workflow">
                <IconButton
                  edge="end"
                  color="error"
                  onClick={() => handleDeleteWorkflow(workflow.id)}
                  disabled={runningWorkflows.has(workflow.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
