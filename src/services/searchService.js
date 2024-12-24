import axios from 'axios';

const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const GOOGLE_CSE_ID = process.env.REACT_APP_GOOGLE_CSE_ID;

export const searchService = {
  async searchApp(query, searchType = 'web') {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/customsearch/v1`, {
          params: {
            key: GOOGLE_API_KEY,
            cx: GOOGLE_CSE_ID,
            q: query + (searchType === 'web' ? ' app' : ' app icon logo'),
            searchType: searchType === 'image' ? 'image' : undefined,
            num: 10,
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Google search error:', error);
      throw new Error('Failed to search for app information');
    }
  },

  findOfficialUrl(searchData, appName) {
    if (!searchData?.items?.length) return null;
    
    const lowerAppName = appName.toLowerCase();
    const items = searchData.items;
    
    // Look for official website patterns
    const patterns = [
      item => item.link.includes(`${lowerAppName}.com`),
      item => item.link.includes(`${lowerAppName}.org`),
      item => item.link.includes(`${lowerAppName}.io`),
      item => item.link.includes('github.com'),
      item => item.link.includes('microsoft.com'),
      item => item.link.includes('apple.com'),
      item => item.link.includes('google.com'),
    ];

    for (const pattern of patterns) {
      const match = items.find(pattern);
      if (match) return match.link;
    }

    return items[0].link;
  },

  findBestImage(imageData, appName) {
    if (!imageData?.items?.length) return null;

    const items = imageData.items;
    const lowerAppName = appName.toLowerCase();

    // Prioritize images with these keywords in the title or URL
    const keywords = ['logo', 'icon', 'app', lowerAppName];

    // Find the best match
    const bestMatch = items.find(item => 
      keywords.some(keyword => 
        item.title?.toLowerCase().includes(keyword) || 
        item.link?.toLowerCase().includes(keyword)
      )
    );

    return bestMatch?.link || items[0].link;
  },

  suggestCategory(appName, description = '') {
    const text = `${appName} ${description}`.toLowerCase();
    
    const categoryPatterns = {
      productivity: ['office', 'work', 'todo', 'notes', 'calendar', 'mail', 'email', 'docs'],
      development: ['code', 'dev', 'programming', 'ide', 'editor', 'git'],
      communication: ['chat', 'message', 'meet', 'call', 'video', 'conference'],
      design: ['design', 'photo', 'image', 'video', 'art', 'creative'],
      utilities: ['system', 'tool', 'utility', 'convert', 'clean', 'monitor'],
      entertainment: ['game', 'music', 'video', 'stream', 'play'],
      social: ['social', 'network', 'share', 'community'],
      education: ['learn', 'study', 'course', 'education', 'teach'],
    };

    for (const [category, patterns] of Object.entries(categoryPatterns)) {
      if (patterns.some(pattern => text.includes(pattern))) {
        return category;
      }
    }

    return 'other';
  }
};
