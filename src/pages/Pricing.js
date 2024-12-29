import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';

const features = [
  'Unlimited app launches',
  'AI-powered smart suggestions',
  'Voice control integration',
  'Custom categories and tags',
  'Cloud backup & sync',
  'Priority customer support',
  'Advanced security features',
  'Regular feature updates'
];

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <Box sx={{ py: 8, bgcolor: 'background.default' }}>
      <Container maxWidth="sm">
        <Typography
          component="h1"
          variant="h2"
          align="center"
          color="text.primary"
          gutterBottom
          sx={{ mb: 6, fontWeight: 'bold' }}
        >
          Special Offer
        </Typography>

        <Card
          sx={{
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 6,
            },
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" component="div" align="center" gutterBottom>
              Premium Plan
            </Typography>

            <Box sx={{ textAlign: 'center', my: 3 }}>
              <Typography
                variant="h3"
                component="span"
                color="primary"
                sx={{ fontWeight: 'bold' }}
              >
                $29.99
              </Typography>
              <Typography
                variant="h6"
                component="span"
                color="text.secondary"
                sx={{
                  textDecoration: 'line-through',
                  ml: 2,
                }}
              >
                $99.99
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                One-time payment
              </Typography>
            </Box>

            <List>
              {features.map((feature, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={feature} />
                </ListItem>
              ))}
            </List>

            <Stack spacing={2} sx={{ mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/signup')}
                sx={{
                  py: 2,
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }}
              >
                Get Started Now
              </Button>
              <Typography variant="body2" color="text.secondary" align="center">
                30-day money-back guarantee
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
          * Prices are in USD. VAT may apply.
        </Typography>
      </Container>
    </Box>
  );
}
