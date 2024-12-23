import React from 'react';
import { Box, Container, Grid, Typography, Link } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const Footer = () => {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        py: 6,
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              App Repository
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your one-stop solution for managing and sharing applications.
              Built with love for developers.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Box>
              {['Home', 'Features', 'Pricing', 'Documentation'].map((text) => (
                <Link
                  key={text}
                  href="#"
                  color="text.secondary"
                  display="block"
                  sx={{ mb: 1, '&:hover': { color: 'primary.main' } }}
                >
                  {text}
                </Link>
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Connect With Us
            </Typography>
            <Box sx={{ mt: 2 }}>
              {[GitHubIcon, TwitterIcon, LinkedInIcon].map((Icon, index) => (
                <Link
                  key={index}
                  href="#"
                  color="text.secondary"
                  sx={{ mr: 2, '&:hover': { color: 'primary.main' } }}
                >
                  <Icon />
                </Link>
              ))}
            </Box>
          </Grid>
        </Grid>
        <Box sx={{ mt: 5 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} App Repository. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
