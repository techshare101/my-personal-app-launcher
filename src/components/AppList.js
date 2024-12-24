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
  Skeleton,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
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
import { useFirestore } from '../hooks/useFirestore';
import { useLayout, LAYOUT_TYPES } from '../contexts/LayoutContext';
import LayoutSwitcher from './LayoutSwitcher';
import { analyticsService } from '../services/analyticsService';
import { useAuth } from '../contexts/AuthContext';

export default function AppList({ apps, onAddClick, onDeleteApp }) {
  const [loadingImages, setLoadingImages] = useState({});
  const { isOnline } = useFirestore();
  const { layoutType, columnCount } = useLayout();
  const { currentUser } = useAuth();
  const [activeSession, setActiveSession] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isLaptop = useMediaQuery(theme.breakpoints.down('lg'));

  const getEffectiveLayout = () => {
    if (layoutType !== LAYOUT_TYPES.ADAPTIVE) {
      return layoutType;
    }

    // For adaptive view, choose layout based on screen size
    if (isMobile) {
      return LAYOUT_TYPES.LIST; // List view for mobile
    }
    return LAYOUT_TYPES.GRID; // Grid view for larger screens
  };

  const getGridColumns = () => {
    if (layoutType === LAYOUT_TYPES.GRID) {
      return columnCount;
    }
    
    // For adaptive view, adjust columns based on screen size
    if (isMobile) return 1;
    if (isTablet) return 2;
    if (isLaptop) return 3;
    return 4;
  };

  const handleLaunchApp = async (app) => {
    if (!isOnline && !app.offlineCapable) {
      alert('This app requires an internet connection');
      return;
    }

    try {
      // Validate URL
      let url = app.url;
      if (!url) {
        throw new Error('App URL is missing');
      }

      // Add protocol if missing
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      // Start tracking session
      if (currentUser) {
        const sessionId = await analyticsService.trackAppLaunch(currentUser.uid, app.id, app);
        setActiveSession({ id: sessionId, startTime: Date.now() });
      }

      // Launch the app
      const newWindow = window.open(url, '_blank');
      if (newWindow === null) {
        throw new Error('Pop-up was blocked. Please allow pop-ups for this site.');
      }

      // Set up a visibility change listener to track when user switches back
      const handleVisibilityChange = () => {
        if (document.hidden && activeSession) {
          const duration = (Date.now() - activeSession.startTime) / 1000 / 60; // Convert to minutes
          analyticsService.trackAppClose(currentUser.uid, activeSession.id, duration);
          setActiveSession(null);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
    } catch (error) {
      console.error('Error launching app:', error);
      alert(error.message || 'Failed to launch the app. Please check the URL and try again.');
    }
  };

  const handleImageLoad = (appId) => {
    setLoadingImages(prev => ({ ...prev, [appId]: false }));
  };

  const handleImageError = (appId) => {
    setLoadingImages(prev => ({ ...prev, [appId]: false }));
  };

  const renderGridView = () => (
    <Grid 
      container 
      spacing={{ xs: 2, sm: 3 }}
      columns={{ xs: 1, sm: 8, md: 12, lg: 16 }}
      sx={{
        '& .MuiGrid-item': {
          display: 'flex',
          transition: 'all 0.3s ease-in-out',
        }
      }}
    >
      {/* Add App Card */}
      <Grid item xs={1} sm={4} md={4} lg={4}>
        <Card
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'action.hover',
              transform: 'translateY(-4px)',
              boxShadow: (theme) => theme.shadows[8],
            },
            transition: 'all 0.2s ease-in-out',
          }}
          onClick={onAddClick}
        >
          <CardContent sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'action.selected',
                mb: 2,
              }}
            >
              <AddIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            </Box>
            <Typography variant="h6" component="div" color="primary">
              Add New App
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Click to add a new application to your launcher
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* App Cards */}
      {apps.map((app) => (
        <Grid item key={app.id} xs={1} sm={4} md={4} lg={4}>
          <Card
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: (theme) => theme.shadows[8],
                '& .app-actions': {
                  opacity: 1,
                  transform: 'translateY(0)',
                },
              },
              transition: 'all 0.2s ease-in-out',
              opacity: !isOnline && !app.offlineCapable ? 0.7 : 1,
            }}
          >
            {/* Offline/Online Badge */}
            {(!isOnline || app.offlineCapable) && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 1,
                  bgcolor: 'background.paper',
                  borderRadius: '50%',
                  p: 0.5,
                  boxShadow: 1,
                }}
              >
                {app.offlineCapable ? (
                  <Badge color="success" variant="dot">
                    <CloudDoneIcon fontSize="small" color="success" />
                  </Badge>
                ) : (
                  <CloudOffIcon fontSize="small" color="action" />
                )}
              </Box>
            )}

            {/* App Image */}
            <Box sx={{ position: 'relative', pt: '56.25%' /* 16:9 aspect ratio */ }}>
              {loadingImages[app.id] !== false ? (
                <Skeleton
                  variant="rectangular"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    bgcolor: 'grey.100'
                  }}
                  animation="wave"
                />
              ) : null}
              <CardMedia
                component="img"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  bgcolor: 'background.paper',
                  p: 2,
                  display: loadingImages[app.id] === false ? 'block' : 'none'
                }}
                image={getAppIcon(app)}
                alt={app.name}
                onLoad={() => handleImageLoad(app.id)}
                onError={() => handleImageError(app.id)}
              />
            </Box>

            {/* App Content */}
            <CardContent sx={{ flexGrow: 1, pt: 2 }}>
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  mb: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {app.name}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{
                  mb: 2,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  height: '2.5em',
                }}
              >
                {app.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={app.category}
                  size="small"
                  sx={{
                    textTransform: 'capitalize',
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                  }}
                />
                {app.offlineCapable && (
                  <Chip
                    label="Offline Ready"
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                )}
                {app.tags?.slice(0, 2).map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{ textTransform: 'capitalize' }}
                  />
                ))}
                {app.tags?.length > 2 && (
                  <Chip
                    label={`+${app.tags.length - 2}`}
                    size="small"
                    variant="outlined"
                    sx={{ textTransform: 'capitalize' }}
                  />
                )}
              </Box>
            </CardContent>

            {/* App Actions */}
            <CardActions
              className="app-actions"
              sx={{
                justifyContent: 'flex-end',
                gap: 1,
                bgcolor: 'background.paper',
                borderTop: 1,
                borderColor: 'divider',
                opacity: { xs: 1, sm: 0 },
                transform: { xs: 'none', sm: 'translateY(100%)' },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <IconButton
                size="small"
                onClick={() => handleLaunchApp(app)}
                title={!isOnline && !app.offlineCapable ? 'Requires internet connection' : 'Launch application'}
                color="primary"
                disabled={!isOnline && !app.offlineCapable}
              >
                <LaunchIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onDeleteApp(app.id)}
                title="Remove application"
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

  const renderListView = () => (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {/* Add App List Item */}
      <ListItem
        button
        onClick={onAddClick}
        sx={{
          mb: 2,
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 1,
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <ListItemAvatar>
          <Avatar sx={{ bgcolor: 'action.selected' }}>
            <AddIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary="Add New App" />
      </ListItem>

      {/* App List Items */}
      {apps.map((app) => (
        <Paper
          key={app.id}
          elevation={1}
          sx={{
            mb: 2,
            opacity: !isOnline && !app.offlineCapable ? 0.7 : 1,
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateX(8px)',
            },
          }}
        >
          <ListItem>
            <ListItemAvatar>
              <Avatar
                src={getAppIcon(app)}
                alt={app.name}
                variant="rounded"
              />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1">{app.name}</Typography>
                  {app.offlineCapable ? (
                    <Badge color="success" variant="dot">
                      <CloudDoneIcon fontSize="small" color="success" />
                    </Badge>
                  ) : (
                    !isOnline && <CloudOffIcon fontSize="small" color="action" />
                  )}
                </Box>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {app.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={app.category}
                      size="small"
                      sx={{
                        textTransform: 'capitalize',
                        bgcolor: 'primary.light',
                        color: 'primary.contrastText',
                      }}
                    />
                    {app.offlineCapable && (
                      <Chip
                        label="Offline Ready"
                        size="small"
                        color="success"
                        variant="outlined"
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
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={() => handleLaunchApp(app)}
                title={!isOnline && !app.offlineCapable ? 'Requires internet connection' : 'Launch application'}
                color="primary"
                disabled={!isOnline && !app.offlineCapable}
                sx={{ mr: 1 }}
              >
                <LaunchIcon />
              </IconButton>
              <IconButton
                edge="end"
                onClick={() => onDeleteApp(app.id)}
                title="Remove application"
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        </Paper>
      ))}
    </List>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <LayoutSwitcher />
      </Box>
      {getEffectiveLayout() === LAYOUT_TYPES.LIST ? renderListView() : renderGridView()}
    </Box>
  );
}
