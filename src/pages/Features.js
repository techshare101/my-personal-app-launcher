import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import VoiceOverOffIcon from '@mui/icons-material/VoiceOverOff';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';

const features = [
  {
    title: 'AI-Powered Smart Launch',
    description: 'Advanced AI algorithms learn your preferences and predict which apps you need before you even search.',
    icon: <AutoAwesomeIcon sx={{ fontSize: 40, color: '#4285f4' }} />,
    details: [
      'Predictive app suggestions',
      'Personalized launch patterns',
      'Smart categorization',
      'Usage analytics'
    ]
  },
  {
    title: 'Voice Control Integration',
    description: 'Launch and control your apps using natural voice commands with our advanced voice recognition system.',
    icon: <VoiceOverOffIcon sx={{ fontSize: 40, color: '#34a853' }} />,
    details: [
      'Natural language processing',
      'Multi-language support',
      'Custom voice commands',
      'Voice shortcuts'
    ]
  },
  {
    title: 'AI Assistant',
    description: 'Built-in AI assistant helps you manage apps, find information, and automate tasks.',
    icon: <SmartToyIcon sx={{ fontSize: 40, color: '#ea4335' }} />,
    details: [
      'Contextual help',
      'Task automation',
      'App recommendations',
      'Smart search'
    ]
  },
  {
    title: 'Enhanced Security',
    description: 'Advanced security features protect your apps and data with state-of-the-art encryption.',
    icon: <SecurityIcon sx={{ fontSize: 40, color: '#fbbc05' }} />,
    details: [
      'Biometric authentication',
      'End-to-end encryption',
      'Secure app vault',
      'Privacy controls'
    ]
  },
  {
    title: 'Lightning Fast Performance',
    description: 'Optimized for speed with instant app launches and minimal resource usage.',
    icon: <SpeedIcon sx={{ fontSize: 40, color: '#4285f4' }} />,
    details: [
      'Instant launch',
      'Background optimization',
      'Resource management',
      'Cache system'
    ]
  }
];

export default function Features() {
  return (
    <Box sx={{ py: 8, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Typography
          component="h1"
          variant="h2"
          align="center"
          color="text.primary"
          gutterBottom
          sx={{ mb: 6, fontWeight: 'bold' }}
        >
          Outstanding Features
        </Typography>

        <Grid container spacing={6}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  {feature.icon}
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2" align="center">
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary" paragraph align="center">
                    {feature.description}
                  </Typography>
                  <List>
                    {feature.details.map((detail, idx) => (
                      <ListItem key={idx}>
                        <ListItemIcon>
                          <CheckCircleIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={detail} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
