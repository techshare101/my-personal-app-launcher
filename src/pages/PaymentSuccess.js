import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SupportIcon from '@mui/icons-material/Support';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useStripe } from '../contexts/StripeContext';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { verifySubscription } = useStripe();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (sessionId) {
        try {
          await verifySubscription(sessionId);
          setLoading(false);
        } catch (error) {
          console.error('Error verifying subscription:', error);
          navigate('/pricing');
        }
      }
    };

    verifyPayment();
  }, [sessionId, verifySubscription, navigate]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 2,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          }}
        >
          <CheckCircleIcon
            color="success"
            sx={{ fontSize: 64, mb: 2 }}
          />
          
          <Typography variant="h4" gutterBottom>
            Welcome to Pro!
          </Typography>
          
          <Typography variant="h6" color="text.secondary" paragraph>
            Your subscription has been successfully activated
          </Typography>

          <List sx={{ mt: 4, mb: 4 }}>
            <ListItem>
              <ListItemIcon>
                <RocketLaunchIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Access All Pro Features"
                secondary="Your account has been upgraded with all premium features"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SupportIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Priority Support"
                secondary="Get faster responses and dedicated assistance"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <MenuBookIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Documentation"
                secondary="Access comprehensive guides and tutorials"
              />
            </ListItem>
          </List>

          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/dashboard')}
              sx={{ mr: 2 }}
            >
              Go to Dashboard
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              onClick={() => navigate('/settings')}
            >
              Configure Settings
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
