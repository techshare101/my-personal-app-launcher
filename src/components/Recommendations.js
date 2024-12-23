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
} from '@mui/material';
import RecommendIcon from '@mui/icons-material/Recommend';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useRecommendations } from '../hooks/useRecommendations';

export default function Recommendations({ onAddApp }) {
  const {
    recommendations,
    timeSuggestions,
    loading,
    error,
    refreshRecommendations
  } = useRecommendations();

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
              <ListItem
                key={index}
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
                  primary={app.name}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {app.description}
                      </Typography>
                      <Chip
                        label={app.priority}
                        size="small"
                        color={
                          app.priority === 'high' ? 'error' :
                          app.priority === 'medium' ? 'warning' : 'default'
                        }
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  }
                />
              </ListItem>
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
              <ListItem key={index}>
                <ListItemText
                  primary={suggestion.appId}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {suggestion.reason}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Relevance: {Math.round(suggestion.relevanceScore * 100)}%
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}
