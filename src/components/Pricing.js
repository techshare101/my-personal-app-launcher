import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Container,
} from '@mui/material';
import { useStripe } from '../contexts/StripeContext';
import { useAuth } from '../contexts/AuthContext';
import PromotionBanner from './PromotionBanner';
import { getCurrentPromotions, trackPromoCodeUsage } from '../services/promotionService';

const tiers = [
  {
    title: 'Pro Monthly',
    price: '9.99',
    description: [
      'Advanced app management',
      'Unlimited integrations',
      'Priority support',
      'Custom workflows',
      'AI-powered features'
    ],
    buttonText: 'Start Monthly Plan',
    buttonVariant: 'contained',
    priceId: 'price_1QdbV5LAPHuinE5Dy9nMTro0', 
    interval: 'month'
  },
  {
    title: 'Pro Annual',
    subheader: 'Save 67%',
    price: '39.99',
    description: [
      'Everything in Pro Monthly',
      'Best value for money',
      '2 months free',
      'Early access to new features'
    ],
    buttonText: 'Start Annual Plan',
    buttonVariant: 'contained',
    priceId: 'price_1QdbV5LAPHuinE5DSHZPacN9', 
    interval: 'year',
    highlighted: true
  }
];

export default function Pricing() {
  const { createCheckoutSession } = useStripe();
  const { user } = useAuth();
  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    setPromotions(getCurrentPromotions());
  }, []);

  const handleSubscribe = async (priceId) => {
    if (!user) {
      // Redirect to login
      return;
    }

    try {
      await createCheckoutSession(priceId);
      // Promotion tracking will be handled by the webhook
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  return (
    <Container maxWidth="lg" component="main" sx={{ 
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 200px)', // Adjust for header/footer
      py: 8 
    }}>
      {promotions.map((promo, index) => (
        <PromotionBanner
          key={promo.code}
          promoCode={promo.code}
          endDate={promo.endDate}
          description={promo.description}
        />
      ))}

      <Grid container spacing={5} alignItems="center" justifyContent="center">
        {tiers.map((tier) => (
          <Grid
            item
            key={tier.title}
            xs={12}
            sm={6}
            md={6}
          >
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                p: 2,
                ...(tier.highlighted && {
                  background: 'linear-gradient(180deg, rgba(144, 202, 249, 0.2) 0%, rgba(0, 0, 0, 0) 100%)',
                  border: '1px solid',
                  borderColor: 'primary.main',
                })
              }}
            >
              <CardHeader
                title={tier.title}
                subheader={tier.subheader}
                titleTypography={{ align: 'center', fontWeight: 'bold' }}
                subheaderTypography={{ 
                  align: 'center',
                  color: 'success.main',
                  fontWeight: 'bold'
                }}
                sx={{
                  backgroundColor: (theme) =>
                    tier.highlighted
                      ? theme.palette.primary.light
                      : 'transparent',
                }}
              />
              <CardContent sx={{ flex: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'baseline',
                    mb: 2,
                  }}
                >
                  <Typography component="h2" variant="h3" color="text.primary">
                    ${tier.price}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    /{tier.interval}
                  </Typography>
                </Box>
                <ul>
                  {tier.description.map((line) => (
                    <Typography
                      component="li"
                      variant="subtitle1"
                      align="center"
                      key={line}
                    >
                      {line}
                    </Typography>
                  ))}
                </ul>
                {tier.interval === 'year' && (
                  <Typography
                    variant="subtitle2"
                    color="success.main"
                    sx={{ mt: 1, fontWeight: 'bold' }}
                  >
                    Save ${(9.99 * 12 - 39.99).toFixed(2)} per year
                  </Typography>
                )}
              </CardContent>
              <Button
                fullWidth
                variant={tier.buttonVariant}
                onClick={() => handleSubscribe(tier.priceId)}
                sx={{ mt: 'auto' }}
              >
                {tier.buttonText}
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
