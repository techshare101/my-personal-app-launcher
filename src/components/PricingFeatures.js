import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Tooltip,
  IconButton,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const features = [
  {
    name: 'App Management',
    free: 'Up to 10 apps',
    pro: 'Unlimited apps',
    tooltip: 'Number of apps you can manage in your launcher'
  },
  {
    name: 'Custom Categories',
    free: 'Basic categories',
    pro: 'Custom categories & tags',
    tooltip: 'Create and organize apps with custom categories'
  },
  {
    name: 'AI Assistant',
    free: 'Basic commands',
    pro: 'Advanced AI features',
    tooltip: 'AI-powered app suggestions and workflow automation'
  },
  {
    name: 'Voice Control',
    free: '✓',
    pro: '✓ Enhanced',
    tooltip: 'Control your apps with voice commands'
  },
  {
    name: 'Workflow Automation',
    free: '✕',
    pro: '✓',
    tooltip: 'Create custom workflows and automations'
  },
  {
    name: 'Integration Support',
    free: 'Limited',
    pro: 'Full access',
    tooltip: 'Integrate with other apps and services'
  },
  {
    name: 'Cloud Sync',
    free: 'Basic sync',
    pro: 'Real-time sync',
    tooltip: 'Sync your apps and settings across devices'
  },
  {
    name: 'Priority Support',
    free: '✕',
    pro: '✓',
    tooltip: 'Get priority support from our team'
  },
  {
    name: 'Custom Themes',
    free: 'Basic themes',
    pro: 'Premium themes',
    tooltip: 'Customize the look and feel of your launcher'
  },
  {
    name: 'Usage Analytics',
    free: 'Basic stats',
    pro: 'Detailed analytics',
    tooltip: 'Track your app usage and productivity'
  }
];

export default function PricingFeatures() {
  return (
    <Box sx={{ mt: 6, mb: 6 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Feature Comparison
      </Typography>
      <TableContainer component={Paper} sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.light' }}>
              <TableCell>Feature</TableCell>
              <TableCell align="center">Free</TableCell>
              <TableCell align="center">Pro</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {features.map((feature) => (
              <TableRow
                key={feature.name}
                sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
              >
                <TableCell component="th" scope="row">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {feature.name}
                    <Tooltip title={feature.tooltip} arrow>
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  {feature.free === '✓' ? (
                    <CheckIcon color="success" />
                  ) : feature.free === '✕' ? (
                    <CloseIcon color="error" />
                  ) : (
                    feature.free
                  )}
                </TableCell>
                <TableCell 
                  align="center"
                  sx={{ 
                    color: 'primary.main',
                    fontWeight: 'bold'
                  }}
                >
                  {feature.pro === '✓' ? (
                    <CheckIcon color="success" />
                  ) : feature.pro === '✕' ? (
                    <CloseIcon color="error" />
                  ) : (
                    feature.pro
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
