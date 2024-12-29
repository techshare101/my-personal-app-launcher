import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AppsProvider } from './contexts/AppsContext';
import { WorkflowProvider } from './contexts/WorkflowContext';
import AppLayout from './components/AppLayout';
import theme from './theme';

function App() {
  return (
    <AuthProvider>
      <AppsProvider>
        <WorkflowProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <NotificationProvider>
              <Router>
                <AppLayout />
              </Router>
            </NotificationProvider>
          </ThemeProvider>
        </WorkflowProvider>
      </AppsProvider>
    </AuthProvider>
  );
}

export default App;
