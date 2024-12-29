import React from 'react';
import { Box, Container, Typography, Button, Grid, styled, Grow } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const GradientText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(45deg, #FF6B6B, #9c27b0)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}));

const Hero = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleGetStarted = () => {
    navigate(currentUser ? '/dashboard' : '/signup');
  };

  return (
    <Box
      component="section"
      sx={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'background.default',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Grow in={true} timeout={1000}>
              <Box>
                <Typography
                  component="h1"
                  variant="h2"
                  align="center"
                  color="text.primary"
                  gutterBottom
                >
                  Smart App Launcher
                </Typography>
                <Typography
                  variant="h5"
                  color="text.secondary"
                  sx={{ mb: 4 }}
                >
                  Streamline your workflow with a centralized hub for all your applications.
                  Connect, automate, and boost your productivity.
                </Typography>
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleGetStarted}
                    sx={{
                      background: 'linear-gradient(45deg, #FF6B6B, #9c27b0)',
                      color: 'white',
                      px: 4,
                    }}
                  >
                    {currentUser ? 'Go to Dashboard' : 'Get Started'}
                  </Button>
                  {!currentUser && (
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/login')}
                      sx={{ px: 4 }}
                    >
                      Login
                    </Button>
                  )}
                </Box>
              </Box>
            </Grow>
          </Grid>
          <Grid item xs={12} md={6}>
            <Grow in={true} timeout={1000} style={{ transitionDelay: '500ms' }}>
              <Box
                sx={{
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle, rgba(156,39,176,0.1) 0%, rgba(255,107,107,0.1) 100%)',
                    borderRadius: '50%',
                    filter: 'blur(40px)',
                  },
                }}
              >
                {/* Add your hero image or illustration here */}
              </Box>
            </Grow>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Hero;
