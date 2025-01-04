import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AppsProvider } from './contexts/AppsContext';
import { WorkflowProvider } from './contexts/WorkflowContext';
import { StripeProvider } from './contexts/StripeContext';
import AppLayout from './components/AppLayout';
import theme from './theme';
import { isWeb } from './utils/environment';

function App() {
  // Show a message if running in web environment
  if (isWeb()) {
    console.log('Running in web environment - some features may be limited');
  }

  return (
    <AuthProvider>
      <AppsProvider>
        <WorkflowProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <SnackbarProvider maxSnack={3}>
              <StripeProvider>
                <NotificationProvider>
                  <Router>
                    <AppLayout />
                  </Router>
                </NotificationProvider>
              </StripeProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </WorkflowProvider>
      </AppsProvider>
    </AuthProvider>
  );
}

export default App;
