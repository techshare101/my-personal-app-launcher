import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '../contexts/AuthContext';
import NotificationCenter from './NotificationCenter';
import Dashboard from '../pages/Dashboard';
import Hero from './Hero';
import Features from './Features';
import Footer from './Footer';
import GetStarted from '../pages/GetStarted';
import ChatBot from './ChatBot';

export default function AppLayout() {
  const { currentUser, loginWithGoogle, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

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
            App Launcher
          </Typography>

          {currentUser ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <NotificationCenter />
              {currentUser.photoURL ? (
                <IconButton
                  onClick={handleMenu}
                  sx={{ ml: 2 }}
                >
                  <Avatar
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    sx={{ width: 32, height: 32 }}
                  />
                </IconButton>
              ) : (
                <IconButton
                  color="inherit"
                  onClick={handleMenu}
                  sx={{ ml: 2 }}
                >
                  <AccountCircleIcon />
                </IconButton>
              )}
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose}>Profile</MenuItem>
                <MenuItem onClick={handleClose}>My Account</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          ) : (
            <Button color="inherit" onClick={loginWithGoogle}>
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Routes>
        <Route path="/" element={
          <div>
            <Hero />
            <Features />
            <Footer />
          </div>
        } />
        <Route path="/get-started" element={<GetStarted />} />
        <Route path="/dashboard" element={
          <React.Suspense fallback={<div>Loading...</div>}>
            <Dashboard />
          </React.Suspense>
        } />
        <Route path="/apps" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      
      <ChatBot />
    </>
  );
}
