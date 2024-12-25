import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../contexts/AuthContext';
import NotificationCenter from './NotificationCenter';
import UserProfile from './UserProfile';
import Dashboard from '../pages/Dashboard';
import Hero from './Hero';
import Features from './Features';
import Footer from './Footer';
import GetStarted from '../pages/GetStarted';

export default function AppLayout() {
  const { currentUser, loginWithGoogle } = useAuth();

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🚀 My App Launcher (Updated Dec 25)
          </Typography>

          {currentUser ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationCenter />
              <UserProfile />
            </Box>
          ) : (
            <Button 
              color="inherit" 
              onClick={loginWithGoogle}
              startIcon={
                <img 
                  src="https://www.google.com/favicon.ico" 
                  alt="Google"
                  style={{ width: 16, height: 16 }}
                />
              }
            >
              Sign In with Google
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ minHeight: 'calc(100vh - 64px)' }}>
        <Routes>
          <Route path="/" element={
            currentUser ? <Navigate to="/dashboard" /> : (
              <>
                <Hero />
                <Features />
                <Footer />
              </>
            )
          } />
          <Route
            path="/dashboard/*"
            element={currentUser ? <Dashboard /> : <Navigate to="/" />}
          />
          <Route
            path="/get-started"
            element={currentUser ? <GetStarted /> : <Navigate to="/" />}
          />
        </Routes>
      </Box>
    </>
  );
}
