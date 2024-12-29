import React, { useState } from 'react';
import { 
  Box, 
  Chip, 
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import NoteIcon from '@mui/icons-material/Note';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import TaskIcon from '@mui/icons-material/Task';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PhotoIcon from '@mui/icons-material/Photo';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SyncIcon from '@mui/icons-material/Sync';

const categories = [
  'all',
  'productivity',
  'development',
  'entertainment',
  'communication',
  'design',
  'finance',
  'security',
  'utilities',
  'audio',
  'video',
  'ai',
  'personal'
];

const personalSubcategories = {
  'personal.notes': { label: 'Notes & Docs', icon: <NoteIcon /> },
  'personal.bookmarks': { label: 'Bookmarks', icon: <BookmarkIcon /> },
  'personal.tasks': { label: 'Tasks & Goals', icon: <TaskIcon /> },
  'personal.calendar': { label: 'Calendar & Events', icon: <CalendarTodayIcon /> },
  'personal.photos': { label: 'Photos & Memories', icon: <PhotoIcon /> },
  'personal.finance': { label: 'Personal Finance', icon: <AttachMoneyIcon /> },
  'personal.health': { label: 'Health & Fitness', icon: <FitnessCenterIcon /> },
  'personal.integrations': { label: 'Integrations & Automation', icon: <SyncIcon /> }
};

export default function CategoryFilter({ selectedCategory, onCategoryChange }) {
  const [personalMenuAnchor, setPersonalMenuAnchor] = useState(null);

  const handlePersonalClick = (event) => {
    event.preventDefault();
    if (selectedCategory.startsWith('personal.')) {
      // If a subcategory is selected, just show the menu
      setPersonalMenuAnchor(event.currentTarget);
    } else {
      // If no subcategory is selected, select 'personal' category
      onCategoryChange('personal');
      setPersonalMenuAnchor(event.currentTarget);
    }
  };

  const handleSubcategorySelect = (subcategory) => {
    onCategoryChange(subcategory);
    setPersonalMenuAnchor(null);
  };

  const getChipColor = (category) => {
    if (category === selectedCategory) return 'primary';
    if (category === 'personal' && selectedCategory.startsWith('personal.')) return 'primary';
    return 'default';
  };

  const getChipLabel = (category) => {
    if (category === 'personal' && selectedCategory.startsWith('personal.')) {
      return personalSubcategories[selectedCategory]?.label || 'Personal';
    }
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Categories
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {categories.map((category) => (
          <Chip
            key={category}
            label={getChipLabel(category)}
            onClick={category === 'personal' ? handlePersonalClick : () => onCategoryChange(category)}
            color={getChipColor(category)}
            variant={selectedCategory === category || (category === 'personal' && selectedCategory.startsWith('personal.')) ? 'filled' : 'outlined'}
            icon={category === 'personal' ? <FolderIcon /> : undefined}
            deleteIcon={category === 'personal' ? <ExpandMoreIcon /> : undefined}
            onDelete={category === 'personal' ? handlePersonalClick : undefined}
            sx={{
              '& .MuiChip-deleteIcon': {
                color: 'inherit',
              },
            }}
          />
        ))}
      </Box>

      <Menu
        anchorEl={personalMenuAnchor}
        open={Boolean(personalMenuAnchor)}
        onClose={() => setPersonalMenuAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {Object.entries(personalSubcategories).map(([key, { label, icon }]) => (
          <MenuItem
            key={key}
            onClick={() => handleSubcategorySelect(key)}
            selected={selectedCategory === key}
          >
            <ListItemIcon>
              {icon}
            </ListItemIcon>
            <ListItemText primary={label} />
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
