import React from 'react';
import { Box, Container, Grid, Typography, Paper, Grow } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import GroupsIcon from '@mui/icons-material/Groups';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <Grow in={true} timeout={1000} style={{ transitionDelay: `${delay}ms` }}>
    <Paper
      elevation={3}
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        transition: 'transform 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-8px)',
        },
      }}
    >
      <Box
        sx={{
          width: 60,
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          bgcolor: 'primary.main',
          color: 'white',
          mb: 2,
        }}
      >
        <Icon sx={{ fontSize: 32 }} />
      </Box>
      <Typography variant="h6" component="h3" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Paper>
  </Grow>
);

const Features = () => {
  const features = [
    {
      icon: CloudUploadIcon,
      title: 'Easy Integration',
      description: 'Connect your favorite apps and services with just a few clicks.',
      delay: 0,
    },
    {
      icon: SecurityIcon,
      title: 'Secure Access',
      description: 'Your data is protected with enterprise-grade security.',
      delay: 200,
    },
    {
      icon: SpeedIcon,
      title: 'Fast Performance',
      description: 'Lightning-fast app launches and seamless workflow automation.',
      delay: 400,
    },
    {
      icon: GroupsIcon,
      title: 'Team Collaboration',
      description: 'Share apps and workflows with your team members.',
      delay: 600,
    },
  ];

  return (
    <Box
      component="section"
      sx={{
        py: 8,
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          component="h2"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            mb: 6,
          }}
        >
          Features
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={feature.title}>
              <FeatureCard {...feature} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Features;
