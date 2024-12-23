import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Box,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';

const categories = [
  'productivity',
  'development',
  'entertainment',
  'communication',
  'design',
  'finance',
  'security',
  'utilities'
];

const FALLBACK_DATA = {
  'vscode': {
    name: 'Visual Studio Code',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Visual_Studio_Code_1.35_icon.svg/512px-Visual_Studio_Code_1.35_icon.svg.png',
    description: 'Visual Studio Code is a lightweight but powerful source code editor which runs on your desktop.',
    url: 'https://code.visualstudio.com/'
  },
  'chrome': {
    name: 'Google Chrome',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Google_Chrome_icon_%28February_2022%29.svg/512px-Google_Chrome_icon_%28February_2022%29.svg.png',
    description: 'Google Chrome is a fast, secure, and free web browser, built for the modern web.',
    url: 'https://www.google.com/chrome/'
  },
  'firefox': {
    name: 'Mozilla Firefox',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Firefox_logo%2C_2019.svg/512px-Firefox_logo%2C_2019.svg.png',
    description: 'Mozilla Firefox is a free and open-source web browser developed by the Mozilla Foundation.',
    url: 'https://www.mozilla.org/firefox/'
  },
  'webstorm': {
    name: 'WebStorm',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/WebStorm_Icon.svg/512px-WebStorm_Icon.svg.png',
    description: 'WebStorm is a powerful IDE for modern JavaScript development.',
    url: 'https://www.jetbrains.com/webstorm/'
  },
  'slack': {
    name: 'Slack',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Slack_icon_2019.svg/512px-Slack_icon_2019.svg.png',
    description: 'Slack is a messaging app for business that connects people to the information they need.',
    url: 'https://slack.com/'
  },
  'discord': {
    name: 'Discord',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Discord_icon.svg/512px-Discord_icon.svg.png',
    description: 'Discord is a VoIP and instant messaging platform designed for creating communities.',
    url: 'https://discord.com/'
  },
  'zoom': {
    name: 'Zoom',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Zoom_Logo_2022.svg/512px-Zoom_Logo_2022.svg.png',
    description: 'Zoom is a video communications app that allows you to set up virtual video and audio conferencing.',
    url: 'https://zoom.us/'
  },
  'spotify': {
    name: 'Spotify',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Spotify_icon.svg/512px-Spotify_icon.svg.png',
    description: 'Spotify is a digital music streaming service that gives you access to millions of songs.',
    url: 'https://www.spotify.com/'
  },
  'photoshop': {
    name: 'Adobe Photoshop',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Adobe_Photoshop_CC_icon.svg/512px-Adobe_Photoshop_CC_icon.svg.png',
    description: 'Adobe Photoshop is an image editing and manipulation software.',
    url: 'https://www.adobe.com/products/photoshop.html'
  },
  'figma': {
    name: 'Figma',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Figma-logo.svg/512px-Figma-logo.svg.png',
    description: 'Figma is a collaborative web application for interface design.',
    url: 'https://www.figma.com/'
  },
  'notion': {
    name: 'Notion',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Notion-logo.svg/512px-Notion-logo.svg.png',
    description: 'Notion is an all-in-one workspace for notes, documents, wikis, and project management.',
    url: 'https://www.notion.so/'
  },
  'github': {
    name: 'GitHub',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Octicons-mark-github.svg/512px-Octicons-mark-github.svg.png',
    description: 'GitHub is a web-based hosting service for version control using Git.',
    url: 'https://github.com/'
  },
  'loom': {
    name: 'Loom',
    thumbnail: 'https://cdn.loom.com/assets/brand/logo-dark.svg',
    description: 'Loom is a video messaging tool that helps you get your message across through instantly shareable videos.',
    url: 'https://www.loom.com/'
  },
  'producthunt': {
    name: 'Product Hunt',
    thumbnail: 'https://ph-static.imgix.net/ph-logo-1.png',
    description: 'Product Hunt is a platform to discover and share new products.',
    url: 'https://www.producthunt.com/'
  },
  'websparks': {
    name: 'WebSparks',
    thumbnail: 'https://www.websparks.sg/images/websparks-logo.png',
    description: 'WebSparks is a web development and digital solutions company.',
    url: 'https://www.websparks.sg/'
  }
};

const AddAppDialog = ({ open, onClose, onAdd }) => {
  const [appName, setAppName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGoogleSearch = async (query, searchType = 'web') => {
    try {
      // First, check if we have fallback data
      const searchKey = query.toLowerCase().replace(/[^a-z0-9]/g, '');
      const fallbackKey = Object.keys(FALLBACK_DATA).find(key => 
        searchKey.includes(key) || key.includes(searchKey)
      );

      if (fallbackKey) {
        console.log('Using fallback data for:', fallbackKey);
        return { items: [{ 
          title: FALLBACK_DATA[fallbackKey].name,
          pagemap: { 
            cse_image: [{ src: FALLBACK_DATA[fallbackKey].thumbnail }] 
          },
          snippet: FALLBACK_DATA[fallbackKey].description,
          link: FALLBACK_DATA[fallbackKey].url
        }]};
      }

      // If no fallback data, try Google Search API
      const params = new URLSearchParams({
        key: process.env.REACT_APP_GOOGLE_API_KEY,
        cx: process.env.REACT_APP_GOOGLE_CX,
        q: searchType === 'image' 
          ? `${query} app icon logo transparent`
          : `${query} official website OR download page`,
        searchType: searchType === 'image' ? 'image' : undefined,
        num: 10,
        imgSize: searchType === 'image' ? 'MEDIUM' : undefined,
        imgType: searchType === 'image' ? 'clipart' : undefined,
        safe: 'active',
      });

      const url = `https://www.googleapis.com/customsearch/v1?${params}`;
      console.log(`Fetching ${searchType} search for ${query}:`, url);

      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error?.message || `Failed to fetch from Google API: ${response.status}`);
      }

      const data = await response.json();
      console.log(`${searchType} search results for ${query}:`, data);

      if (!data.items || data.items.length === 0) {
        throw new Error('No search results found');
      }

      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      // Return a generic app data if API fails
      return { items: [{ 
        title: query,
        pagemap: { 
          cse_image: [{ 
            src: `https://ui-avatars.com/api/?name=${encodeURIComponent(query)}&size=512&background=random&color=fff&bold=true&format=svg` 
          }] 
        },
        snippet: `Information about ${query}`,
        link: `https://www.google.com/search?q=${encodeURIComponent(query + ' download')}`
      }]};
    }
  };

  const findOfficialUrl = (searchResults, appName) => {
    if (!searchResults?.items?.length) return null;

    const cleanAppName = appName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Function to score a URL based on how likely it is to be official
    const scoreUrl = (url) => {
      let score = 0;
      const lowerUrl = url.toLowerCase();

      // Direct domain match (e.g., slack.com for Slack)
      if (lowerUrl.includes(cleanAppName)) score += 10;
      
      // Common official domain patterns
      if (lowerUrl.match(/^https?:\/\/(www\.)?([\w-]+)\.(com|io|ai|app|dev|org|net)\/?$/)) score += 5;
      
      // Prefer shorter URLs as they're more likely to be homepages
      score += 5 * (1 / (url.split('/').length));

      // Prefer certain domains
      if (lowerUrl.includes('.com/')) score += 3;
      if (lowerUrl.includes('.io/')) score += 2;
      if (lowerUrl.includes('.app/')) score += 2;
      
      // Penalize certain patterns
      if (lowerUrl.includes('google.com')) score -= 5;
      if (lowerUrl.includes('wikipedia.org')) score -= 3;
      if (lowerUrl.includes('github.com') && !cleanAppName.includes('github')) score -= 2;
      
      return score;
    };

    // Score and sort all URLs
    const scoredUrls = searchResults.items
      .map(item => ({ url: item.link, score: scoreUrl(item.link) }))
      .sort((a, b) => b.score - a.score);

    console.log('Scored URLs:', scoredUrls);

    // Return the URL with the highest score
    return scoredUrls[0]?.url || null;
  };

  const findBestImage = (searchResults, appName) => {
    if (!searchResults?.items?.length) return null;

    // Helper function to score an image URL
    const scoreImage = (imageUrl) => {
      let score = 0;
      const lowerUrl = imageUrl.toLowerCase();

      // Prefer PNG and SVG formats
      if (lowerUrl.endsWith('.png')) score += 5;
      if (lowerUrl.endsWith('.svg')) score += 5;
      
      // Prefer images from official sources
      if (lowerUrl.includes(appName.toLowerCase().replace(/[^a-z0-9]/g, ''))) score += 3;
      if (lowerUrl.includes('logo')) score += 2;
      if (lowerUrl.includes('icon')) score += 2;
      
      // Prefer images from certain domains
      if (lowerUrl.includes('githubusercontent.com')) score += 3;
      if (lowerUrl.includes('wikimedia.org')) score += 2;
      if (lowerUrl.includes('cloudfront.net')) score += 2;
      
      // Penalize certain patterns
      if (lowerUrl.includes('screenshot')) score -= 2;
      if (lowerUrl.includes('banner')) score -= 1;
      
      return score;
    };

    // Get all available images from the search results
    const images = searchResults.items.flatMap(item => {
      const images = [];
      
      // Check link (direct image URL)
      if (item.link) images.push(item.link);
      
      // Check pagemap
      if (item.pagemap?.cse_image?.[0]?.src) {
        images.push(item.pagemap.cse_image[0].src);
      }
      
      // Check metatags
      if (item.pagemap?.metatags?.[0]) {
        const metatags = item.pagemap.metatags[0];
        if (metatags['og:image']) images.push(metatags['og:image']);
        if (metatags['twitter:image']) images.push(metatags['twitter:image']);
      }
      
      return images;
    });

    // Score and sort images
    const scoredImages = images
      .filter(Boolean)
      .map(url => ({ url, score: scoreImage(url) }))
      .sort((a, b) => b.score - a.score);

    console.log('Scored images:', scoredImages);

    return scoredImages[0]?.url || null;
  };

  const suggestCategory = (appName, description) => {
    const text = `${appName} ${description}`.toLowerCase();
    
    // Define category patterns
    const categoryPatterns = {
      productivity: /\b(document|notes?|task|project|work|office|email|calendar|meeting)\b/,
      development: /\b(code|programming|developer|ide|git|database|web|api|terminal)\b/,
      entertainment: /\b(game|music|video|stream|media|play|watch|listen)\b/,
      communication: /\b(chat|message|call|meeting|voice|video|team|conference)\b/,
      design: /\b(design|photo|image|graphic|art|draw|creative|ui|ux)\b/,
      finance: /\b(money|finance|bank|payment|accounting|budget|invoice)\b/,
      security: /\b(security|password|vpn|protect|encrypt|backup)\b/,
      utilities: /\b(utility|tool|system|clean|monitor|manage|convert)\b/
    };

    // Check each category pattern
    const matches = Object.entries(categoryPatterns)
      .filter(([_, pattern]) => pattern.test(text))
      .map(([category]) => category);

    // Return the first matching category or 'utilities' as default
    return matches[0] || 'utilities';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!appName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // First, search for the app's website
      const webData = await fetchGoogleSearch(appName, 'web');
      const url = findOfficialUrl(webData, appName) || 
                 `https://www.google.com/search?q=${encodeURIComponent(appName + ' download')}`;

      // Then search for the app's icon
      const imageData = await fetchGoogleSearch(appName, 'image');
      const thumbnail = findBestImage(imageData, appName) || 
        `https://ui-avatars.com/api/?name=${encodeURIComponent(appName)}&size=512&background=random&color=fff&bold=true&format=svg`;

      // Get the best description
      const description = webData.items?.[0]?.snippet || `${appName} application`;

      // Suggest a category based on the app name and description
      const category = suggestCategory(appName, description);

      console.log('Adding app with:', { 
        name: appName,
        thumbnail,
        description,
        url,
        category
      });

      onAdd({
        name: appName,
        thumbnail,
        description,
        url,
        category
      });

      setAppName('');
      onClose();
    } catch (err) {
      console.error('Error fetching app data:', err);
      setError(err.message || 'Failed to fetch app information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Application</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Application Name"
              fullWidth
              variant="outlined"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              disabled={loading}
              helperText="Try popular apps like 'vscode', 'chrome', 'slack', 'discord', 'spotify', etc."
            />
            {error && (
              <Box mt={2}>
                <Alert severity="error">{error}</Alert>
              </Box>
            )}
            {loading && (
              <Box display="flex" justifyContent="center" mt={2}>
                <CircularProgress />
              </Box>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Enter the name of the application you want to add. We'll automatically fetch its thumbnail and description.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !appName.trim()}
              sx={{
                background: 'linear-gradient(45deg, #FF6B6B, #9c27b0)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FF6B6B, #9c27b0)',
                  opacity: 0.9,
                },
              }}
            >
              Add Application
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddAppDialog;
