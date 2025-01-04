import React, { useState, useEffect } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Chip,
  Typography,
  Collapse,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useSnackbar } from 'notistack';

export default function PromotionBanner({ promoCode, endDate, description }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [open, setOpen] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  function calculateTimeLeft() {
    const difference = new Date(endDate) - new Date();
    if (difference <= 0) return null;

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const timeLeft = calculateTimeLeft();
      if (!timeLeft) {
        clearInterval(timer);
      }
      setTimeLeft(timeLeft);
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [endDate]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(promoCode);
    enqueueSnackbar('Promotion code copied to clipboard!', { 
      variant: 'success',
      autoHideDuration: 2000
    });
  };

  if (!timeLeft) return null;

  return (
    <Collapse in={open}>
      <Alert 
        severity="info"
        sx={{ 
          mb: 4, 
          backgroundColor: 'primary.light',
          color: 'text.primary',
          '& .MuiAlert-icon': {
            color: 'primary.main'
          }
        }}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={() => setOpen(false)}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
      >
        <AlertTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          color: 'text.primary',
          fontWeight: 'bold',
          fontSize: '1.1rem'
        }}>
          Special Launch Offer! 🎉
          <Chip
            label="Limited Time"
            color="error"
            size="small"
            sx={{ ml: 1 }}
          />
        </AlertTitle>
        
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mt: 1 }}>
          <Typography variant="body1" sx={{ color: 'text.primary' }}>
            Get 20% off for 3 months! Use code{' '}
            <Chip
              label={promoCode}
              color="primary"
              onClick={handleCopyCode}
              onDelete={handleCopyCode}
              deleteIcon={<ContentCopyIcon />}
              sx={{ 
                fontWeight: 'bold',
                cursor: 'pointer',
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark'
                }
              }}
            />
          </Typography>
          
          <Typography variant="body2" sx={{ color: 'text.secondary', ml: 1 }}>
            Offer ends in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
          </Typography>
        </Box>
      </Alert>
    </Collapse>
  );
}
