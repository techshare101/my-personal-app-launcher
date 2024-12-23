import React, { useState } from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const CATEGORY_KEYWORDS = {
  productivity: ['meeting', 'document', 'notes', 'calendar', 'task', 'project', 'work', 'office', 'email', 'collaboration'],
  development: ['code', 'programming', 'developer', 'ide', 'git', 'database', 'web', 'api', 'terminal'],
  entertainment: ['game', 'music', 'video', 'stream', 'media', 'play', 'watch', 'listen'],
  communication: ['chat', 'message', 'call', 'meeting', 'voice', 'video', 'team', 'conference'],
  design: ['design', 'photo', 'image', 'graphic', 'art', 'draw', 'creative', 'ui', 'ux'],
  finance: ['money', 'finance', 'bank', 'payment', 'accounting', 'budget', 'invoice'],
  security: ['security', 'password', 'vpn', 'protect', 'encrypt', 'backup'],
  utilities: ['utility', 'tool', 'system', 'clean', 'monitor', 'manage', 'convert'],
};

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    // Process the search term to identify categories and keywords
    const searchInfo = processSearchTerm(value);
    onSearch(searchInfo);
  };

  const processSearchTerm = (term) => {
    const lowerTerm = term.toLowerCase();
    const words = lowerTerm.split(/\s+/);
    
    // Detect categories based on keywords
    const matchedCategories = new Set();
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(keyword => words.some(word => word.includes(keyword)))) {
        matchedCategories.add(category);
      }
    }

    // Process natural language queries
    const intentMap = {
      find: ['find', 'search', 'look', 'where'],
      show: ['show', 'display', 'list'],
      open: ['open', 'launch', 'start'],
      my: ['my', 'mine'],
    };

    const intent = {
      action: Object.entries(intentMap).find(([_, keywords]) => 
        keywords.some(keyword => words.includes(keyword))
      )?.[0] || null,
      isPersonal: words.includes('my') || words.includes('mine'),
    };

    return {
      term: lowerTerm,
      categories: Array.from(matchedCategories),
      intent,
      words
    };
  };

  return (
    <TextField
      fullWidth
      variant="outlined"
      placeholder="Search apps or try 'Find my meeting tools'"
      value={searchTerm}
      onChange={handleSearch}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
      sx={{
        mb: 3,
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          backgroundColor: 'background.paper',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        },
      }}
    />
  );
};

export default SearchBar;
