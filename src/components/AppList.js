import React from 'react';
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
} from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import DeleteIcon from '@mui/icons-material/Delete';

export default function AppList({ apps, onAddClick, onDeleteApp }) {
  const handleLaunchApp = (app) => {
    window.open(app.url, '_blank');
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
            '&:hover': { backgroundColor: 'action.hover' },
          }}
          onClick={onAddClick}
        >
          <CardContent sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h6" component="div">
              + Add New App
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* App Cards */}
      {apps.map((app) => (
        <Grid item key={app.id} xs={12} sm={6} md={4} lg={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
              component="img"
              sx={{
                height: 140,
                objectFit: 'contain',
                bgcolor: 'background.paper',
                p: 2
              }}
              image={app.thumbnail}
              alt={app.name}
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(app.name)}&size=512&background=random&color=fff&bold=true&format=svg`;
              }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography gutterBottom variant="h6" component="div">
                {app.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {app.description}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={app.category}
                  size="small"
                  sx={{ textTransform: 'capitalize' }}
                />
              </Box>
            </CardContent>
            <CardActions>
              <IconButton
                size="small"
                onClick={() => handleLaunchApp(app)}
                title="Launch application"
              >
                <LaunchIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onDeleteApp(app.id)}
                title="Remove application"
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
