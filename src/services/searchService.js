import axios from 'axios';

const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const GOOGLE_CSE_ID = process.env.REACT_APP_GOOGLE_CSE_ID;

const CATEGORY_PATTERNS = {
  utility: /\b(utility|tool|system|clean|monitor|optimize|backup|security)\b/,
  productivity: /\b(document|notes?|task|project|work|office|email|calendar|meeting)\b/,
  development: /\b(code|programming|developer|ide|git|database|web|api|terminal)\b/,
  entertainment: /\b(game|music|video|stream|media|play|watch|listen)\b/,
  communication: /\b(chat|message|call|meeting|voice|video|team|conference)\b/,
  design: /\b(design|photo|image|graphic|art|draw|creative|ui|ux)\b/,
  finance: /\b(money|finance|bank|payment|accounting|budget|invoice)\b/,
  security: /\b(security|password|vpn|protect|encrypt|backup)\b/,
};

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
    
    // Check each category pattern
    for (const [category, pattern] of Object.entries(CATEGORY_PATTERNS)) {
      if (pattern.test(text)) {
        return category;
      }
    }

    // Return 'utility' as default category
    return 'utility';
  },

  searchApps(apps, query, category) {
    if (!apps) return [];
    
    const searchTerm = query.toLowerCase();
    
    return apps.filter(app => {
      const matchesSearch = !searchTerm || 
        app.name.toLowerCase().includes(searchTerm) ||
        app.description.toLowerCase().includes(searchTerm) ||
        (app.tags && app.tags.some(tag => tag.toLowerCase().includes(searchTerm)));

      const matchesCategory = !category || 
        category === 'all' || 
        app.category.toLowerCase() === category.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  },

  getRelevanceScore(app, query) {
    const searchTerms = query.toLowerCase().split(' ');
    let score = 0;

    // Name match (highest weight)
    if (searchTerms.some(term => app.name.toLowerCase().includes(term))) {
      score += 0.5;
    }

    // Description match
    if (searchTerms.some(term => app.description.toLowerCase().includes(term))) {
      score += 0.3;
    }

    // Tags match
    if (app.tags && searchTerms.some(term => 
      app.tags.some(tag => tag.toLowerCase().includes(term))
    )) {
      score += 0.2;
    }

    // Category match
    const suggestedCategory = this.suggestCategory(query);
    if (app.category.toLowerCase() === suggestedCategory) {
      score += 0.2;
    }

    return Math.min(score, 1);
  }
};
