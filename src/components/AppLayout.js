import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../contexts/AuthContext';
import NotificationCenter from './NotificationCenter';
import Dashboard from '../pages/Dashboard';
import Login from './Auth/Login';
import SignUp from './Auth/SignUp';
import PrivateRoute from './Auth/PrivateRoute';
import Hero from './Hero';
import Features from '../pages/Features';
import Pricing from '../pages/Pricing';
import Documentation from '../pages/Documentation';
import Footer from './Footer';
import GetStarted from '../pages/GetStarted';
import ChatBot from './ChatBot';
import { Link as RouterLink } from 'react-router-dom';

export default function AppLayout() {
  const { currentUser, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);
  const location = useLocation();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleHamburgerMenu = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      handleClose();
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isOnDashboard = location.pathname === '/dashboard';

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleHamburgerMenu}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="menu-appbar-hamburger"
            anchorEl={menuAnchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem 
              component={RouterLink} 
              to="/features" 
              onClick={handleMenuClose}
            >
              Features
            </MenuItem>
            <MenuItem 
              component={RouterLink} 
              to="/pricing" 
              onClick={handleMenuClose}
            >
              Pricing
            </MenuItem>
            <MenuItem 
              component={RouterLink} 
              to="/documentation" 
              onClick={handleMenuClose}
            >
              Documentation
            </MenuItem>
          </Menu>
          
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
            Smart App Launcher
          </Typography>

          {currentUser && isOnDashboard && (
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
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/" element={
            <Box>
              <Hero />
              <Footer />
            </Box>
          } />
        </Routes>
      </Box>

      <ChatBot />
    </Box>
  );
}
