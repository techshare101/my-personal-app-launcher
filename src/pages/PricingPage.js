import React from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  AlertTitle,
} from '@mui/material';
import Pricing from '../components/Pricing';
import PricingFeatures from '../components/PricingFeatures';

export default function PricingPage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ pt: 8, pb: 6 }}>
        <Typography
          component="h1"
          variant="h2"
          align="center"
          color="text.primary"
          gutterBottom
        >
          Choose Your Plan
        </Typography>
        <Typography
          variant="h5"
          align="center"
          color="text.secondary"
          component="p"
          sx={{ mb: 4 }}
        >
          Start with our free plan or upgrade to Pro for advanced features
        </Typography>

        <Alert 
          severity="info" 
          sx={{ 
            maxWidth: 600, 
            mx: 'auto', 
            mb: 6,
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          <AlertTitle>Try Pro Features Free for 14 Days</AlertTitle>
          <Typography variant="body2">
            Start your free trial today and get access to all Pro features.
            No credit card required for trial period.
          </Typography>
        </Alert>

        <Pricing />
        <PricingFeatures />

        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Need help choosing?
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Contact our support team for guidance on selecting the right plan for your needs.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
