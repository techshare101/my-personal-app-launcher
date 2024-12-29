import React from 'react';
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Avatar,
  Grid,
  Rating,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Software Developer',
    avatar: 'S',
    rating: 5,
    comment: 'Smart App Launcher has revolutionized how I organize and access my development tools. The AI suggestions are incredibly accurate!',
  },
  {
    name: 'Michael Chen',
    role: 'Digital Artist',
    avatar: 'M',
    rating: 5,
    comment: 'The voice control feature is a game-changer. I can switch between my design apps without taking my hands off my drawing tablet.',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Content Creator',
    avatar: 'E',
    rating: 5,
    comment: 'This app has significantly improved my workflow. The smart categorization and quick launch features save me hours every week.',
  },
];

const faqs = [
  {
    question: 'What makes Smart App Launcher different from other launchers?',
    answer: "Smart App Launcher uses advanced AI algorithms to learn your app usage patterns and predict which apps you'll need. It also features voice control, smart categorization, and seamless integration with your workflow.",
  },
  {
    question: 'How does the AI suggestion system work?',
    answer: "Our AI system analyzes your app usage patterns, time of day, current tasks, and other contextual factors to predict which apps you're most likely to need. The system continuously learns and adapts to your habits.",
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes! We use industry-standard encryption and security measures to protect your data. All personal information and app usage data is encrypted and stored securely. We never share your data with third parties.',
  },
  {
    question: 'Can I use voice commands in multiple languages?',
    answer: 'Yes, Smart App Launcher supports voice commands in multiple languages. The system can recognize and process commands in English, Spanish, French, German, and many other languages.',
  },
  {
    question: 'Do you offer a refund policy?',
    answer: 'Yes, we offer a 30-day money-back guarantee. If you are not satisfied with Smart App Launcher, you can request a full refund within 30 days of purchase.',
  },
  {
    question: 'How often do you release updates?',
    answer: 'We release regular updates every month with bug fixes and performance improvements. Major feature updates are typically released quarterly.',
  },
];

export default function Documentation() {
  return (
    <Box sx={{ py: 8, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        {/* Testimonials Section */}
        <Typography
          component="h1"
          variant="h2"
          align="center"
          color="text.primary"
          gutterBottom
          sx={{ mb: 6, fontWeight: 'bold' }}
        >
          What Our Users Say
        </Typography>

        <Grid container spacing={4} sx={{ mb: 8 }}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
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
                <CardContent>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      {testimonial.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="div">
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                  <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    "{testimonial.comment}"
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 8 }} />

        {/* FAQ Section */}
        <Typography
          component="h2"
          variant="h3"
          align="center"
          color="text.primary"
          gutterBottom
          sx={{ mb: 6 }}
        >
          Frequently Asked Questions
        </Typography>

        {faqs.map((faq, index) => (
          <Accordion key={index} sx={{ mb: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index}-content`}
              id={`panel${index}-header`}
            >
              <Typography variant="h6">{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">{faq.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    </Box>
  );
}
