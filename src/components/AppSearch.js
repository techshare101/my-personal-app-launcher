import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

const CATEGORIES = [
  'Productivity',
  'Communication',
  'Development',
  'Design',
  'Social',
  'Entertainment',
  'Business',
  'Education',
  'Other'
];

export default function AppSearch({ searchQuery, category, onSearchChange, onCategoryChange }) {
  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 2, 
      mb: 3,
      flexDirection: { xs: 'column', sm: 'row' }
    }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search apps..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ flexGrow: 1 }}
      />
      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel id="category-filter-label">
          <FilterListIcon sx={{ mr: 1 }} />
          Category
        </InputLabel>
        <Select
          labelId="category-filter-label"
          value={category}
          label="Category"
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <MenuItem value="">All Categories</MenuItem>
          {CATEGORIES.map((cat) => (
            <MenuItem key={cat} value={cat.toLowerCase()}>
              {cat}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}