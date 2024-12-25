import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  IconButton,
  Chip,
  Box,
  Button,
  Skeleton,
  Badge,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import { getAppIcon } from '../utils/appIcons';
import { useLayout } from '../contexts/LayoutContext';
import { analyticsService } from '../services/analyticsService';

export default function AppList({ apps = [], loading = false, onSelect, onLaunch, onDeleteApp, onAddClick }) {
  const [loadingImages, setLoadingImages] = useState({});
  const { layoutType } = useLayout();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleLaunchApp = (app, e) => {
    e?.stopPropagation();
    if (onLaunch) {
      onLaunch(app);
    } else {
      try {
        let url = app.url;
        if (!url) {
          throw new Error('App URL is missing');
        }

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }

        window.open(url, '_blank', 'noopener,noreferrer');
        
        // Track app launch
        analyticsService.trackEvent('app_launched', {
          appId: app.id,
          appName: app.name,
        });
      } catch (error) {
        console.error('Error launching app:', error);
        alert(error.message || 'Failed to launch the app. Please check the URL and try again.');
      }
    }
  };

  const handleDeleteApp = (app, e) => {
    e?.stopPropagation();
    if (window.confirm(`Are you sure you want to remove ${app.name}?`)) {
      onDeleteApp(app.id);
      analyticsService.trackEvent('app_deleted', {
        appId: app.id,
        appName: app.name,
      });
    }
  };

  const handleImageLoad = (appId) => {
    setLoadingImages(prev => ({ ...prev, [appId]: false }));
  };

  const handleImageError = (appId) => {
    setLoadingImages(prev => ({ ...prev, [appId]: false }));
  };

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3].map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item}>
            <Card>
              <Skeleton variant="rectangular" height={140} />
              <CardContent>
                <Skeleton variant="text" />
                <Skeleton variant="text" />
                <Skeleton variant="text" width="60%" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  const renderGridView = () => (
    <Grid container spacing={3}>
      {/* Add App Card */}
      <Grid item xs={12} sm={6} md={3}>
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 4,
            },
            transition: 'all 0.2s ease-in-out',
          }}
          onClick={onAddClick}
        >
          <Box
            sx={{
              height: 140,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'action.hover',
            }}
          >
            <AddIcon sx={{ fontSize: 48, color: 'primary.main' }} />
          </Box>
          <CardContent>
            <Typography variant="h6" gutterBottom align="center">
              Add New App
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Add an app manually or search
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* App Cards */}
      {apps.map((app) => (
        <Grid item xs={12} sm={6} md={3} key={app.id}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              },
              transition: 'all 0.2s ease-in-out',
            }}
            onClick={() => onSelect && onSelect(app)}
          >
            <CardMedia
              component="img"
              height={140}
              image={getAppIcon(app)}
              alt={app.name}
              sx={{
                objectFit: 'contain',
                bgcolor: 'background.default',
                p: 2,
              }}
              onLoad={() => handleImageLoad(app.id)}
              onError={() => handleImageError(app.id)}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom>
                {app.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {app.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {app.category && (
                  <Chip
                    label={app.category}
                    size="small"
                    color="primary"
                    sx={{ textTransform: 'capitalize' }}
                  />
                )}
                {app.tags?.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{ textTransform: 'capitalize' }}
                  />
                ))}
              </Box>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end', gap: 1, p: 2 }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<LaunchIcon />}
                onClick={(e) => handleLaunchApp(app, e)}
              >
                Launch
              </Button>
              <IconButton
                size="small"
                onClick={(e) => handleDeleteApp(app, e)}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box>
      {renderGridView()}
    </Box>
  );
}
