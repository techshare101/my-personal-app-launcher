import React, { useState } from 'react';
import { 
  TextField, 
  InputAdornment, 
  IconButton, 
  Popover, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Typography,
  Box,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LaunchIcon from '@mui/icons-material/Launch';
import AppsIcon from '@mui/icons-material/Apps';
import LanguageIcon from '@mui/icons-material/Language';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';

const CATEGORY_KEYWORDS = {
  productivity: ['meeting', 'document', 'notes', 'calendar', 'task', 'project', 'work', 'office', 'email', 'collaboration'],
  development: ['code', 'programming', 'developer', 'ide', 'git', 'database', 'web', 'api', 'terminal', 'debug', 'compiler'],
  entertainment: ['game', 'music', 'video', 'stream', 'media', 'play', 'watch', 'listen'],
  communication: ['chat', 'message', 'call', 'meeting', 'voice', 'video', 'team', 'conference'],
  design: ['design', 'photo', 'image', 'graphic', 'art', 'draw', 'creative', 'ui', 'ux'],
  finance: ['money', 'finance', 'bank', 'payment', 'accounting', 'budget', 'invoice'],
  security: ['security', 'password', 'vpn', 'protect', 'encrypt', 'backup'],
  utilities: ['utility', 'tool', 'system', 'clean', 'monitor', 'manage', 'convert'],
  audio: ['audio', 'sound', 'music', 'recording', 'podcast', 'voice', 'mixer'],
  video: ['video', 'player', 'streaming', 'editor', 'recording', 'screen capture'],
  ai: ['ai', 'artificial intelligence', 'machine learning', 'chatbot', 'neural', 'gpt', 'model']
};

const SEARCH_ENGINES = {
  google: {
    name: 'Google',
    url: 'https://www.google.com/search?q=',
    icon: <LanguageIcon />
  },
  github: {
    name: 'GitHub',
    url: 'https://github.com/search?q=',
    icon: <AppsIcon />
  }
};

const SearchBar = ({ onSearch, apps }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  
  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (value.trim()) {
      // Show search popover
      setAnchorEl(event.currentTarget);
      
      // Process the search term
      const searchInfo = processSearchTerm(value);
      
      // Generate search results
      const results = generateSearchResults(value, searchInfo, apps);
      setSearchResults(results);
      
      onSearch(searchInfo);
    } else {
      setAnchorEl(null);
      onSearch({ term: '', categories: [], intent: {}, words: [] });
    }
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

  const generateSearchResults = (term, searchInfo, apps) => {
    const results = [];
    const lowerTerm = term.toLowerCase();

    // Add matching apps
    const matchingApps = apps.filter(app => 
      app.name.toLowerCase().includes(lowerTerm) ||
      app.description?.toLowerCase().includes(lowerTerm) ||
      searchInfo.categories.includes(app.category)
    ).slice(0, 5);

    if (matchingApps.length > 0) {
      results.push({
        type: 'header',
        text: 'Apps'
      });
      results.push(...matchingApps.map(app => ({
        type: 'app',
        data: app
      })));
    }

    // Add web search options
    results.push({ type: 'header', text: 'Web Search' });
    Object.entries(SEARCH_ENGINES).forEach(([engine, data]) => {
      results.push({
        type: 'web',
        engine,
        data
      });
    });

    return results;
  };

  const handleResultClick = (result) => {
    if (result.type === 'app') {
      window.open(result.data.url, '_blank');
    } else if (result.type === 'web') {
      window.open(result.data.url + encodeURIComponent(searchTerm), '_blank');
    }
    setAnchorEl(null);
    setSearchTerm('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && searchTerm.trim()) {
      // Open first result or Google search
      const firstResult = searchResults.find(r => r.type === 'app' || r.type === 'web');
      if (firstResult) {
        handleResultClick(firstResult);
      }
    }
  };

  return (
    <>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search apps or the web (e.g., 'Find my meeting tools' or 'chatgpt')"
        value={searchTerm}
        onChange={handleSearch}
        onKeyDown={handleKeyDown}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <InputAdornment position="end">
              <Tooltip title="Press Enter to search">
                <KeyboardReturnIcon color="action" />
              </Tooltip>
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

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            width: anchorEl?.offsetWidth,
            mt: 1,
            boxShadow: 3,
          }
        }}
      >
        <List sx={{ p: 0 }}>
          {searchResults.map((result, index) => {
            if (result.type === 'header') {
              return (
                <ListItem key={index} sx={{ py: 0.5, px: 2, bgcolor: 'action.selected' }}>
                  <Typography variant="caption" color="text.secondary">
                    {result.text}
                  </Typography>
                </ListItem>
              );
            }
            
            if (result.type === 'app') {
              return (
                <ListItem
                  key={index}
                  button
                  onClick={() => handleResultClick(result)}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <img 
                      src={result.data.thumbnail} 
                      alt={result.data.name}
                      style={{ width: 24, height: 24 }}
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary={result.data.name}
                    secondary={result.data.category}
                  />
                  <LaunchIcon fontSize="small" color="action" />
                </ListItem>
              );
            }

            if (result.type === 'web') {
              return (
                <ListItem
                  key={index}
                  button
                  onClick={() => handleResultClick(result)}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {result.data.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={`Search ${result.data.name}`}
                    secondary={searchTerm}
                  />
                  <LaunchIcon fontSize="small" color="action" />
                </ListItem>
              );
            }

            return null;
          })}
        </List>
      </Popover>
    </>
  );
};

export default SearchBar;
