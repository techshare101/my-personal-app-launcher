import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { v4 as uuidv4 } from 'uuid';

const googleSearch = async (query) => {
  try {
    const response = await fetch(`https://www.googleapis.com/customsearch/v1?key=${process.env.REACT_APP_GOOGLE_API_KEY}&cx=${process.env.REACT_APP_GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data.items?.map(item => ({
      name: item.title,
      url: item.link,
      description: item.snippet,
      icon: item.pagemap?.cse_image?.[0]?.src || null,
    })) || [];
  } catch (error) {
    console.error('Error searching Google:', error);
    return [];
  }
};

export default function AddAppDialog({ open, onClose, onAdd }) {
  const [appName, setAppName] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!appName.trim()) {
      setError('Please enter an app name');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const results = await googleSearch(appName + ' app');
      setSearchResults(results);
    } catch (err) {
      setError('Failed to search for apps. Please try manually adding the app.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddApp = (app) => {
    onAdd({
      id: uuidv4(),
      name: app.name,
      url: app.url,
      description: app.description,
      icon: app.icon,
      addedAt: new Date().toISOString(),
    });
    handleClose();
  };

  const handleManualAdd = () => {
    if (!appName.trim()) {
      setError('Please enter an app name');
      return;
    }
    if (!manualUrl.trim()) {
      setError('Please enter the app URL');
      return;
    }

    handleAddApp({
      name: appName,
      url: manualUrl,
      description: '',
      icon: null,
    });
  };

  const handleClose = () => {
    setAppName('');
    setManualUrl('');
    setSearchResults([]);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New App</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="App Name"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            margin="normal"
            error={!!error}
            helperText={error}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              disabled={loading}
            >
              Search
            </Button>
          </Box>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {searchResults.length > 0 && (
          <>
            <Typography variant="subtitle1" gutterBottom>
              Search Results
            </Typography>
            <List>
              {searchResults.map((result, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText
                      primary={result.name}
                      secondary={result.url}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleAddApp(result)}
                        color="primary"
                      >
                        <AddIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < searchResults.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </>
        )}

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Or Add Manually
          </Typography>
          <TextField
            fullWidth
            label="App URL"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            margin="normal"
            placeholder="https://example.com"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleManualAdd}
          variant="contained"
          color="primary"
          disabled={!appName || !manualUrl}
        >
          Add Manually
        </Button>
      </DialogActions>
    </Dialog>
  );
}
