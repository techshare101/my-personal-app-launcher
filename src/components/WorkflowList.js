import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Paper,
  Box,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteIcon from '@mui/icons-material/Delete';
import { useWorkflows } from '../hooks/useWorkflows';

export default function WorkflowList() {
  const { workflows, deleteWorkflow } = useWorkflows();

  const handleRunWorkflow = (workflow) => {
    workflow.apps.forEach(app => {
      window.open(app.url, '_blank');
    });
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
              <IconButton
                edge="end"
                color="primary"
                onClick={() => handleRunWorkflow(workflow)}
                sx={{ mr: 1 }}
              >
                <PlayArrowIcon />
              </IconButton>
              <IconButton
                edge="end"
                color="error"
                onClick={() => deleteWorkflow(workflow.id)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
