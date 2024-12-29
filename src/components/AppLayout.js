import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../contexts/AuthContext';
import NotificationCenter from './NotificationCenter';
import Dashboard from '../pages/Dashboard';
import Login from './Auth/Login';
import SignUp from './Auth/SignUp';
import PrivateRoute from './Auth/PrivateRoute';
import Hero from './Hero';
import Features from './Features';
import Footer from './Footer';
import GetStarted from '../pages/GetStarted';
import ChatBot from './ChatBot';
import { Link as RouterLink } from 'react-router-dom';

export default function AppLayout() {
  const { currentUser, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      handleClose();
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
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
          
          <Typography 
            variant="h6" 
            component={RouterLink} 
            to="/" 
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'inherit' 
            }}
          >
            App Launcher
          </Typography>

          {currentUser && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationCenter />
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                {currentUser.photoURL ? (
                  <Avatar src={currentUser.photoURL} />
                ) : (
                  <Avatar>{currentUser.email ? currentUser.email[0].toUpperCase() : 'U'}</Avatar>
                )}
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
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
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/login" element={
            !currentUser ? <Login /> : <Navigate to="/dashboard" replace />
          } />
          <Route path="/signup" element={
            !currentUser ? <SignUp /> : <Navigate to="/dashboard" replace />
          } />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/" element={
            <Box>
              <Hero />
              <Features />
              <Footer />
            </Box>
          } />
        </Routes>
      </Box>

      <ChatBot />
    </Box>
  );
}
