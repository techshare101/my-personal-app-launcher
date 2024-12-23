import React from 'react';
import { Box, Container, Typography, Button, Grid, styled, Grow } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const GradientText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(45deg, #FF6B6B, #9c27b0)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}));

const Hero = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/get-started');
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
                <GradientText
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: 'bold',
                    mb: 2,
                  }}
                >
                  Your Personal App Launcher
                </GradientText>
                <Typography
                  variant="h5"
                  color="text.secondary"
                  sx={{ mb: 4 }}
                >
                  Streamline your workflow with a centralized hub for all your applications.
                  Connect, automate, and boost your productivity.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGetStarted}
                  sx={{
                    py: 1.5,
                    px: 4,
                    background: 'linear-gradient(45deg, #FF6B6B, #9c27b0)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #FF6B6B, #9c27b0)',
                      opacity: 0.9,
                    },
                  }}
                >
                  Get Started
                </Button>
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
