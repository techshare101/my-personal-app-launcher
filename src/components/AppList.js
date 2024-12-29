import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  IconButton,
  Chip,
  Box,
} from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CategoryFilter from './CategoryFilter';
import SearchBar from './SearchBar';

const AppList = ({ apps, onAddClick, onDeleteApp }) => {
  const [filteredApps, setFilteredApps] = useState(apps);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchInfo, setSearchInfo] = useState(null);

  useEffect(() => {
    let filtered = [...apps];

    // Apply category filter
    if (selectedCategory !== 'all') {
      if (selectedCategory.startsWith('personal.')) {
        filtered = filtered.filter(app => app.category === selectedCategory);
      } else {
        filtered = filtered.filter(app => {
          // If selected category is 'personal', show all personal subcategories
          if (selectedCategory === 'personal') {
            return app.category.startsWith('personal.');
          }
          return app.category === selectedCategory;
        });
      }
    }

    // Apply search filter if there's a search term
    if (searchInfo?.term) {
      filtered = filtered.filter(app => 
        app.name.toLowerCase().includes(searchInfo.term.toLowerCase()) ||
        app.description?.toLowerCase().includes(searchInfo.term.toLowerCase()) ||
        searchInfo.categories.includes(app.category)
      );
    }

    setFilteredApps(filtered);
  }, [apps, selectedCategory, searchInfo]);

  const handleLaunchApp = (app) => {
    window.open(app.url, '_blank');
  };

  const handleSearch = (info) => {
    setSearchInfo(info);
    // If search contains category keywords, update the category filter
    if (info.categories.length > 0) {
      setSelectedCategory(info.categories[0]);
    }
  };

  const getCategoryLabel = (category) => {
    if (category.startsWith('personal.')) {
      const subcategories = {
        'personal.notes': 'Notes & Docs',
        'personal.bookmarks': 'Bookmarks',
        'personal.tasks': 'Tasks & Goals',
        'personal.calendar': 'Calendar & Events',
        'personal.photos': 'Photos & Memories',
        'personal.finance': 'Personal Finance',
        'personal.health': 'Health & Fitness',
        'personal.integrations': 'Integrations & Automation'
      };
      return subcategories[category] || category;
    }
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: 3 }}>
      <SearchBar onSearch={handleSearch} apps={apps} />
      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      <Grid container spacing={3}>
        {/* Add App Card */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card
            sx={{
              height: '180px',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              '&:hover': { backgroundColor: 'action.hover' },
              '& .MuiCardContent-root': {
                py: 1,
                px: 2,
                flex: '1 0 auto'
              }
            }}
            onClick={onAddClick}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <IconButton size="large" sx={{ mb: 1 }}>
                <AddIcon fontSize="large" />
              </IconButton>
              <Typography variant="subtitle1" align="center">
                Add New App
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* App Cards - Sort by creation date in descending order */}
        {filteredApps
          .sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0))
          .map((app) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={app.id}>
              <Card sx={{ 
                height: '180px', 
                display: 'flex', 
                flexDirection: 'column',
                '& .MuiCardContent-root': {
                  py: 1,
                  px: 2,
                  flex: '1 0 auto'
                },
                '& .MuiCardActions-root': {
                  py: 0.5,
                  px: 1
                },
                '& .MuiCardMedia-root': {
                  height: '60px',
                  objectFit: 'contain',
                  p: 1,
                  bgcolor: 'background.paper'
                }
              }}>
                <CardMedia
                  component="img"
                  image={app.thumbnail}
                  alt={app.name}
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(app.name)}&size=512&background=random&color=fff&bold=true&format=svg`;
                  }}
                />
                <CardContent>
                  <Typography variant="subtitle2" noWrap>
                    {app.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    fontSize: '0.75rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.2,
                    mt: 0.5
                  }}>
                    {app.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <IconButton size="small" onClick={() => handleLaunchApp(app)}>
                      <LaunchIcon fontSize="small" color="primary" />
                    </IconButton>
                    <IconButton size="small" onClick={() => onDeleteApp(app.id)} color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
      </Grid>
    </Box>
  );
};

export default AppList;
