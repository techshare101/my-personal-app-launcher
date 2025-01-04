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
  Switch,
  FormControlLabel,
  ListItemIcon,
  ListItemText
} from '@mui/material';

const categories = [
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
  ai: ['ai', 'artificial intelligence', 'machine learning', 'chatbot', 'neural', 'gpt', 'model'],
  'personal.notes': ['notes', 'documents', 'writing', 'journal', 'diary', 'documentation'],
  'personal.bookmarks': ['bookmark', 'favorite', 'save', 'link', 'collection', 'read later'],
  'personal.tasks': ['tasks', 'goals', 'todo', 'checklist', 'habits', 'progress'],
  'personal.calendar': ['calendar', 'schedule', 'events', 'planner', 'dates', 'reminders'],
  'personal.photos': ['photos', 'memories', 'gallery', 'albums', 'pictures', 'images'],
  'personal.finance': ['budget', 'expenses', 'savings', 'investments', 'money', 'banking'],
  'personal.health': ['health', 'fitness', 'workout', 'exercise', 'nutrition', 'wellness'],
  'personal.integrations': ['automation', 'workflow', 'zapier', 'ifttt', 'integration', 'sync', 'connect', 'automate']
};

const FALLBACK_DATA = {
  'claude': {
    name: 'Claude',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Anthropic_logo.svg/512px-Anthropic_logo.svg.png',
    description: 'Claude is an AI assistant by Anthropic, known for its helpful, honest, and harmless approach.',
    url: 'https://claude.ai/',
    category: 'ai'
  },
  'notion': {
    name: 'Notion',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Notion-logo.svg/512px-Notion-logo.svg.png',
    description: 'Personal workspace for notes, tasks, and knowledge management.',
    url: 'https://www.notion.so/',
    category: 'personal.notes'
  },
  'github': {
    name: 'GitHub',
    thumbnail: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
    description: 'Web-based platform for version control and collaboration.',
    url: 'https://github.com',
    category: 'development',
    isWebApp: true
  },
  'codeium': {
    name: 'Codeium',
    thumbnail: 'https://codeium.com/favicon.ico',
    description: 'AI-powered code completion and assistance.',
    url: 'https://codeium.com',
    category: 'development',
    isWebApp: true
  },
  'vscode': {
    name: 'Visual Studio Code',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Visual_Studio_Code_1.35_icon.svg/512px-Visual_Studio_Code_1.35_icon.svg.png',
    description: 'Visual Studio Code is a lightweight but powerful source code editor.',
    url: 'https://code.visualstudio.com/',
    path: 'C:\\Users\\%USERNAME%\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe',
    category: 'development'
  },
  'chrome': {
    name: 'Google Chrome',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Google_Chrome_icon_%28February_2022%29.svg/512px-Visual_Studio_Code_1.35_icon.svg.png',
    description: 'Google Chrome is a fast, secure, and free web browser.',
    url: 'https://www.google.com/chrome/',
    path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    category: 'utilities'
  },
  'audacity': {
    name: 'Audacity',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Audacity_Logo_notext.svg/512px-Audacity_Logo_notext.svg.png',
    description: 'Audacity is a free, open-source digital audio editor and recording application.',
    url: 'https://www.audacityteam.org/',
    category: 'audio'
  },
  'vlc': {
    name: 'VLC Media Player',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/VLC_Icon.svg/512px-VLC_Icon.svg.png',
    description: 'VLC is a free and open source cross-platform multimedia player that plays most multimedia files.',
    url: 'https://www.videolan.org/vlc/',
    category: 'video'
  },
  'androidstudio': {
    name: 'Android Studio',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Android_Studio_Trademark.svg/512px-Android_Studio_Trademark.svg.png',
    description: 'Android Studio is the official integrated development environment for Google\'s Android operating system.',
    url: 'https://developer.android.com/studio',
    category: 'development'
  },
  'chatgpt': {
    name: 'ChatGPT',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/512px-ChatGPT_logo.svg.png',
    description: 'ChatGPT is an AI-powered chatbot developed by OpenAI, capable of generating human-like text responses.',
    url: 'https://chat.openai.com/',
    category: 'ai'
  },
  'bard': {
    name: 'Google Bard',
    thumbnail: 'https://www.gstatic.com/lamda/images/favicon_v1_150160cddff7f294ce30.svg',
    description: 'Bard is an AI chatbot by Google that can generate text, analyze images, and help with various tasks.',
    url: 'https://bard.google.com/',
    category: 'ai'
  },
  'midjourney': {
    name: 'Midjourney',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Midjourney_Emblem.png/512px-Midjourney_Emblem.png',
    description: 'Midjourney is an AI-powered tool that generates images from textual descriptions.',
    url: 'https://www.midjourney.com/',
    category: 'ai'
  },
  'evernote': {
    name: 'Evernote',
    thumbnail: 'https://evernote.com/img/logo/evernote_logo_4c-mobile.png',
    description: 'Personal note-taking and organization app for your thoughts and ideas.',
    url: 'https://evernote.com/',
    category: 'personal.notes'
  },
  'pocket': {
    name: 'Pocket',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Pocket_Logo.svg/512px-Pocket_Logo.svg.png',
    description: 'Save and organize your favorite articles, videos, and stories.',
    url: 'https://getpocket.com/',
    category: 'personal.bookmarks'
  },
  'todoist': {
    name: 'Todoist',
    thumbnail: 'https://todoist.com/static/favicon.ico',
    description: 'Personal task manager and to-do list app.',
    url: 'https://todoist.com/',
    category: 'personal.tasks'
  },
  'google-calendar': {
    name: 'Google Calendar',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Calendar_icon_%282020%29.svg/512px-Google_Calendar_icon_%282020%29.svg.png',
    description: 'Personal calendar and event management.',
    url: 'https://calendar.google.com/',
    category: 'personal.calendar'
  },
  'google-photos': {
    name: 'Google Photos',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Photos_icon.svg/512px-Google_Photos_icon.svg.png',
    description: 'Store and organize your personal photos and memories.',
    url: 'https://photos.google.com/',
    category: 'personal.photos'
  },
  'mint': {
    name: 'Mint',
    thumbnail: 'https://mint.intuit.com/favicon.ico',
    description: 'Personal finance and budget tracking app.',
    url: 'https://mint.intuit.com/',
    category: 'personal.finance'
  },
  'myfitnesspal': {
    name: 'MyFitnessPal',
    thumbnail: 'https://www.myfitnesspal.com/favicon.ico',
    description: 'Personal health and fitness tracking app.',
    url: 'https://www.myfitnesspal.com/',
    category: 'personal.health'
  },
  'zapier': {
    name: 'Zapier',
    thumbnail: 'https://cdn.zapier.com/zapier/images/favicon.ico',
    description: 'Connect your apps and automate workflows. Move info between your web apps automatically.',
    url: 'https://zapier.com',
    category: 'personal.integrations'
  },
  'ifttt': {
    name: 'IFTTT',
    thumbnail: 'https://assets.ifttt.com/images/channels/2107379463/icons/monochrome_large.png',
    description: 'Connect your apps and devices to create powerful automations and workflows.',
    url: 'https://ifttt.com',
    category: 'personal.integrations'
  },
  'make': {
    name: 'Make (Integromat)',
    thumbnail: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_477ea5f48b8eb46e6af1980277a494d2/make.png',
    description: 'Visual platform for creating complex automated workflows and integrations.',
    url: 'https://www.make.com',
    category: 'personal.integrations'
  },
  'n8n': {
    name: 'n8n',
    thumbnail: 'https://avatars.githubusercontent.com/u/45487711',
    description: 'Open-source workflow automation tool with a visual interface.',
    url: 'https://n8n.io',
    category: 'personal.integrations'
  },
  'powerautomate': {
    name: 'Power Automate',
    thumbnail: 'https://powerautomate.microsoft.com/images/application-logos/svg/powerautomate.svg',
    description: 'Microsoft\'s automation tool for creating workflows between apps and services.',
    url: 'https://powerautomate.microsoft.com',
    category: 'personal.integrations'
  },
  'automate': {
    name: 'Automate.io',
    thumbnail: 'https://www.automate.io/favicon.ico',
    description: 'Cloud-based integration platform for connecting your apps and automating workflows.',
    url: 'https://automate.io',
    category: 'personal.integrations'
  },
  'tray': {
    name: 'Tray.io',
    thumbnail: 'https://tray.io/favicon.ico',
    description: 'Advanced integration platform for enterprise automation needs.',
    url: 'https://tray.io',
    category: 'personal.integrations'
  },
  'workato': {
    name: 'Workato',
    thumbnail: 'https://workato.com/favicon.ico',
    description: 'Enterprise automation platform for complex business workflows.',
    url: 'https://workato.com',
    category: 'personal.integrations'
  }
};

const personalSubcategories = {
  'personal.notes': { label: 'Notes', icon: <i className="fas fa-sticky-note" /> },
  'personal.bookmarks': { label: 'Bookmarks', icon: <i className="fas fa-bookmark" /> },
  'personal.tasks': { label: 'Tasks', icon: <i className="fas fa-tasks" /> },
  'personal.calendar': { label: 'Calendar', icon: <i className="fas fa-calendar-alt" /> },
  'personal.photos': { label: 'Photos', icon: <i className="fas fa-camera" /> },
  'personal.finance': { label: 'Finance', icon: <i className="fas fa-wallet" /> },
  'personal.health': { label: 'Health', icon: <i className="fas fa-heart" /> },
  'personal.integrations': { label: 'Integrations', icon: <i className="fas fa-plug" /> }
};

const AddAppDialog = ({ open, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    path: '',
    description: '',
    category: 'productivity',
    thumbnail: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [manualMode, setManualMode] = useState(false);

  const fetchGoogleSearch = async (query, searchType = 'web') => {
    try {
      // First, check if we have fallback data
      const searchKey = query.toLowerCase().replace(/[^a-z0-9]/g, '');
      const fallbackKey = Object.keys(FALLBACK_DATA).find(key => 
        searchKey.includes(key) || key.includes(searchKey)
      );

      if (fallbackKey) {
        console.log('Using fallback data for:', fallbackKey);
        return {
          items: [{
            title: FALLBACK_DATA[fallbackKey].name,
            pagemap: {
              cse_image: [{ src: FALLBACK_DATA[fallbackKey].thumbnail }]
            },
            snippet: FALLBACK_DATA[fallbackKey].description,
            link: FALLBACK_DATA[fallbackKey].url
          }]
        };
      }

      // Return mock data since we don't have actual Google API access
      return {
        items: [{
          title: query,
          pagemap: {
            cse_image: [{ 
              src: `https://ui-avatars.com/api/?name=${encodeURIComponent(query)}&size=512&background=random&color=fff&bold=true&format=svg`
            }]
          },
          snippet: `${query} application`,
          link: `https://www.google.com/search?q=${encodeURIComponent(query + ' download')}`
        }]
      };
    } catch (error) {
      console.error('Fetch error:', error);
      return {
        items: [{
          title: query,
          pagemap: {
            cse_image: [{ 
              src: `https://ui-avatars.com/api/?name=${encodeURIComponent(query)}&size=512&background=random&color=fff&bold=true&format=svg`
            }]
          },
          snippet: `Information about ${query}`,
          link: `https://www.google.com/search?q=${encodeURIComponent(query + ' download')}`
        }]
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      let appData;
      
      if (manualMode) {
        // Use manually entered data
        appData = {
          name: formData.name,
          description: formData.description || `${formData.name} application`,
          thumbnail: formData.thumbnail || 
            `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&size=512&background=random&color=fff&bold=true&format=svg`,
          url: formData.url || `https://www.google.com/search?q=${encodeURIComponent(formData.name + ' download')}`,
          path: formData.path,
          category: formData.category,
          isWebApp: !formData.path && formData.url
        };
      } else {
        // Fetch data automatically
        const searchKey = formData.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const fallbackKey = Object.keys(FALLBACK_DATA).find(key => 
          searchKey.includes(key) || key.includes(searchKey)
        );

        if (fallbackKey) {
          console.log('Using fallback data for:', fallbackKey);
          const fallbackApp = FALLBACK_DATA[fallbackKey];
          appData = {
            name: fallbackApp.name,
            description: fallbackApp.description,
            thumbnail: fallbackApp.thumbnail,
            url: fallbackApp.url,
            path: fallbackApp.path,
            category: fallbackApp.category,
            isWebApp: fallbackApp.isWebApp || (!fallbackApp.path && fallbackApp.url)
          };
        } else {
          const webData = await fetchGoogleSearch(formData.name, 'web');
          appData = {
            name: formData.name,
            description: webData.items[0].snippet || `${formData.name} application`,
            thumbnail: webData.items[0].pagemap?.cse_image?.[0]?.src || 
              `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&size=512&background=random&color=fff&bold=true&format=svg`,
            url: webData.items[0].link || `https://www.google.com/search?q=${encodeURIComponent(formData.name + ' download')}`,
            path: formData.path,
            category: formData.category,
            isWebApp: !formData.path
          };
        }
      }

      onAdd(appData);
      setFormData({
        name: '',
        url: '',
        path: '',
        description: '',
        category: 'productivity',
        thumbnail: ''
      });
      setManualMode(false);
      onClose();
    } catch (err) {
      console.error('Error adding app:', err);
      setError(err.message || 'Failed to add application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Application</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <FormControlLabel
            control={
              <Switch
                checked={manualMode}
                onChange={(e) => setManualMode(e.target.checked)}
                name="manualMode"
              />
            }
            label="Manual Entry Mode"
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Application Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
            disabled={loading}
            helperText={!manualMode ? "Try popular apps like 'vscode', 'chrome', 'slack', 'discord', 'spotify', 'chatgpt', 'bard', 'midjourney', 'claude', 'notion', 'evernote', 'pocket', etc." : ""}
          />

          <TextField
            fullWidth
            label="Executable Path"
            value={formData.path}
            onChange={(e) => setFormData({ ...formData, path: e.target.value })}
            margin="normal"
            disabled={loading}
            helperText="Full path to the application executable (optional for web apps)"
          />

          <TextField
            fullWidth
            label="URL"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            margin="normal"
            disabled={loading}
            helperText="Web URL for the application (required for web apps)"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              label="Category"
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category} sx={{ textTransform: 'capitalize' }}>
                  {category}
                </MenuItem>
              ))}
              <MenuItem sx={{ borderTop: 1, borderColor: 'divider', mt: 1, pt: 1 }}>
                <ListItemText primary="Personal Categories" sx={{ color: 'text.secondary' }} />
              </MenuItem>
              {Object.entries(personalSubcategories).map(([key, { label, icon }]) => (
                <MenuItem key={key} value={key}>
                  <ListItemIcon>{icon}</ListItemIcon>
                  <ListItemText primary={label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {manualMode && (
            <>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                margin="normal"
                multiline
                rows={2}
              />

              <TextField
                fullWidth
                label="Thumbnail URL"
                value={formData.thumbnail}
                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                margin="normal"
                placeholder="https://example.com/image.png"
                type="url"
                helperText="Leave empty for auto-generated icon"
              />
            </>
          )}

          {error && (
            <Box mt={2}>
              <Alert severity="error">{error}</Alert>
            </Box>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {manualMode 
              ? "Manually enter all app details"
              : "Enter the app name and we'll automatically fetch its details"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !formData.name.trim()}
            sx={{
              background: 'linear-gradient(45deg, #FF6B6B, #9c27b0)',
              '&:hover': {
                background: 'linear-gradient(45deg, #FF5252, #7b1fa2)'
              }
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Application'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddAppDialog;
