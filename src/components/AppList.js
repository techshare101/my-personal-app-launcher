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
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              '&:hover': { backgroundColor: 'action.hover' },
            }}
            onClick={onAddClick}
          >
            <CardContent sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h6" component="div">
                + Add New App
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* App Cards */}
        {filteredApps.map((app) => (
          <Grid item key={app.id} xs={12} sm={6} md={4} lg={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                sx={{
                  height: 140,
                  objectFit: 'contain',
                  bgcolor: 'background.paper',
                  p: 2
                }}
                image={app.thumbnail}
                alt={app.name}
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(app.name)}&size=512&background=random&color=fff&bold=true&format=svg`;
                }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="div">
                  {app.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {app.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip 
                    label={getCategoryLabel(app.category)}
                    size="small"
                    color={app.category.startsWith('personal.') ? 'primary' : 'default'}
                    variant={app.category.startsWith('personal.') ? 'filled' : 'outlined'}
                  />
                </Box>
              </CardContent>
              <CardActions>
                <IconButton 
                  aria-label="launch"
                  onClick={() => handleLaunchApp(app)}
                  color="primary"
                >
                  <LaunchIcon />
                </IconButton>
                <IconButton 
                  aria-label="delete"
                  onClick={() => onDeleteApp(app.id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AppList;
