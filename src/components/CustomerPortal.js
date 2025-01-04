import React from 'react';
import { useStripe } from '../contexts/StripeContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

export default function CustomerPortal({ open, onClose }) {
  const { createPortalSession } = useStripe();
  const { user } = useAuth();

  const handlePortalAccess = async () => {
    try {
      await createPortalSession();
    } catch (error) {
      console.error('Error accessing customer portal:', error);
    }
  };

  const portalFeatures = [
    {
      icon: <PaymentIcon />,
      primary: 'Manage Subscription',
      secondary: 'Update, cancel, or change your plan'
    },
    {
      icon: <HistoryIcon />,
      primary: 'Billing History',
      secondary: 'View past invoices and payment history'
    },
    {
      icon: <SettingsIcon />,
      primary: 'Payment Methods',
      secondary: 'Update your payment information'
    }
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Subscription Management
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" color="text.secondary" paragraph>
          Access your billing portal to manage your subscription, view payment history, and update payment methods.
        </Typography>
        
        <List>
          {portalFeatures.map((feature, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                {feature.icon}
              </ListItemIcon>
              <ListItemText
                primary={feature.primary}
                secondary={feature.secondary}
              />
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            You'll be redirected to a secure Stripe page to manage your subscription.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handlePortalAccess}
          variant="contained"
          color="primary"
        >
          Access Portal
        </Button>
      </DialogActions>
    </Dialog>
  );
}
