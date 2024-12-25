import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  IconButton,
  TextField,
  CircularProgress,
  Alert,
  Stack,
  Tooltip,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { getAppIcon } from '../utils/appIcons';
import { chatbotService } from '../services/chatbotService';
import { analyticsService } from '../services/analyticsService';

export default function Recommendations({ onAddApp }) {
  const [query, setQuery] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '' });
  const [isFirstQuery, setIsFirstQuery] = useState(true);

  // Add initial load of sample recommendations
  useEffect(() => {
    const loadInitialRecommendations = async () => {
      try {
        setLoading(true);
        const result = await chatbotService.getAppRecommendations("productivity apps", true);
        console.log("Initial recommendations:", result);
        setRecommendations(result.recommendations || []);
      } catch (error) {
        console.error("Error loading initial recommendations:", error);
        setError("Failed to load initial recommendations");
      } finally {
        setLoading(false);
      }
    };

    loadInitialRecommendations();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError(null);
      console.log("Searching for:", query);
      const result = await chatbotService.getAppRecommendations(query, isFirstQuery);
      console.log("Search results:", result);
      
      if (!result || !result.recommendations) {
        throw new Error("Invalid response format from chatbot service");
      }
      
      setRecommendations(result.recommendations);
      setIsFirstQuery(false);
      
      analyticsService.trackEvent('app_recommendations_search', {
        query,
        resultCount: result.recommendations.length
      });
    } catch (error) {
      console.error('Error getting recommendations:', error);
      setError(error.message || 'Failed to get recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddApp = (app) => {
    console.log("Adding app:", app);
    onAddApp({
      name: app.app_name,
      description: app.description
    });
    
    setNotification({
      open: true,
      message: `${app.app_name} has been added to your workflow!`
    });
    
    analyticsService.trackEvent('app_added_from_recommendations', {
      appName: app.app_name,
      query: query
    });
  };

  // Add debug output
  console.log("Current state:", {
    query,
    recommendations,
    loading,
    error,
    isFirstQuery
  });

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        App Recommendations
      </Typography>
      
      <Box component="form" onSubmit={handleSearch} sx={{ mb: 4 }}>
        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
            label="What would you like to accomplish?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., edit videos, manage finances, design a logo"
            InputProps={{
              endAdornment: (
                <IconButton 
                  type="submit"
                  disabled={loading || !query.trim()}
                >
                  <SearchIcon />
                </IconButton>
              )
            }}
          />
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {isFirstQuery && recommendations.length > 0 && (
            <Typography variant="h6" gutterBottom color="primary">
              Let me suggest some apps that might help you with that!
            </Typography>
          )}

          <Grid container spacing={3}>
            {Array.isArray(recommendations) && recommendations.map((app) => (
              <Grid item xs={12} sm={6} md={4} key={app.app_name}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height={140}
                    image={getAppIcon({ name: app.app_name })}
                    alt={app.app_name}
                    sx={{
                      objectFit: 'contain',
                      bgcolor: 'background.default',
                      p: 2,
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {app.app_name}
                      </Typography>
                      <Tooltip title="Add to workflow">
                        <IconButton 
                          color="primary"
                          onClick={() => handleAddApp(app)}
                          size="small"
                        >
                          <AddIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary">
                      {app.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {!loading && !error && (!recommendations || recommendations.length === 0) && query && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No recommendations found. Try describing your task differently.
        </Alert>
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification({ ...notification, open: false })}
        message={notification.message}
      />
    </Box>
  );
}