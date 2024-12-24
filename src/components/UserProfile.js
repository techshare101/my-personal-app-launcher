import React, { useState } from 'react';
import {
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  IconButton,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

export default function UserProfile() {
  const { currentUser, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleClose();
    setProfileOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleClose();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        aria-controls={open ? 'account-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Avatar
          src={currentUser?.photoURL}
          alt={currentUser?.displayName}
          sx={{ width: 32, height: 32 }}
        >
          {currentUser?.displayName?.[0] || currentUser?.email?.[0]}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
      >
        <MenuItem onClick={handleProfileClick}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      <Dialog
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>User Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar
              src={currentUser?.photoURL}
              alt={currentUser?.displayName}
              sx={{ width: 100, height: 100, mb: 2 }}
            >
              {currentUser?.displayName?.[0] || currentUser?.email?.[0]}
            </Avatar>
            <Typography variant="h6" gutterBottom>
              {currentUser?.displayName}
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              {currentUser?.email}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<SettingsIcon />}
              sx={{ mt: 1 }}
            >
              Edit Profile
            </Button>
          </Box>

          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="medium">
              Account Details
            </Typography>
            <List disablePadding>
              <ListItem disableGutters>
                <ListItemAvatar>
                  <Avatar>
                    <SecurityIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Account Security"
                  secondary="2-factor authentication enabled"
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemAvatar>
                  <Avatar>
                    <NotificationsIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Notifications"
                  secondary="Email notifications enabled"
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemAvatar>
                  <Avatar>
                    <LanguageIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Language"
                  secondary="English (US)"
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemAvatar>
                  <Avatar>
                    <StorageIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Storage Used"
                  secondary="2.5 GB of 15 GB"
                />
              </ListItem>
            </List>
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={() => setProfileOpen(false)}>Close</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
