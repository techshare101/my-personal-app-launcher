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
} from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import { getAppIcon } from '../utils/appIcons';
import { useFirestore } from '../hooks/useFirestore';

export default function AppList({ apps, onAddClick, onDeleteApp }) {
  const [loadingImages, setLoadingImages] = useState({});
  const { isOnline } = useFirestore();

  const handleLaunchApp = (app) => {
    if (!isOnline && !app.offlineCapable) {
      alert('This app requires an internet connection');
      return;
    }
    window.open(app.url, '_blank');
  };

  const handleImageLoad = (appId) => {
    setLoadingImages(prev => ({ ...prev, [appId]: false }));
  };

  const handleImageError = (appId) => {
    setLoadingImages(prev => ({ ...prev, [appId]: false }));
  };

  return (
    <Grid container spacing={3}>
      {/* Add App Card */}
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'action.hover',
              transform: 'translateY(-4px)',
            },
            transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out',
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
            <AddIcon sx={{ fontSize: 48, color: 'action.active' }} />
            <Typography variant="h6" component="div">
              Add New App
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* App Cards */}
      {apps.map((app) => (
        <Grid item key={app.id} xs={12} sm={6} md={4} lg={3}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              '&:hover': {
                transform: 'translateY(-4px)',
              },
              transition: 'transform 0.2s ease-in-out',
              opacity: !isOnline && !app.offlineCapable ? 0.7 : 1,
            }}
          >
            {loadingImages[app.id] !== false ? (
              <Skeleton
                variant="rectangular"
                height={140}
                animation="wave"
                sx={{ bgcolor: 'grey.100' }}
              />
            ) : null}
            <CardMedia
              component="img"
              sx={{
                height: 140,
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
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  {app.name}
                </Typography>
                {app.offlineCapable ? (
                  <Badge color="success" variant="dot">
                    <CloudDoneIcon fontSize="small" color="success" />
                  </Badge>
                ) : (
                  !isOnline && <CloudOffIcon fontSize="small" color="action" />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                {app.description}
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
            </CardContent>
            <CardActions>
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
}
