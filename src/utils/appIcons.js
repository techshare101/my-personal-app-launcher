// Default icons for different categories
export const DEFAULT_ICONS = {
  utility: 'https://cdn-icons-png.flaticon.com/512/2991/2991112.png',
  productivity: 'https://cdn-icons-png.flaticon.com/512/1087/1087927.png',
  development: 'https://cdn-icons-png.flaticon.com/512/1005/1005141.png',
  entertainment: 'https://cdn-icons-png.flaticon.com/512/3659/3659784.png',
  communication: 'https://cdn-icons-png.flaticon.com/512/1789/1789313.png',
  design: 'https://cdn-icons-png.flaticon.com/512/1785/1785210.png',
  business: 'https://cdn-icons-png.flaticon.com/512/1087/1087840.png',
  education: 'https://cdn-icons-png.flaticon.com/512/2232/2232688.png',
  other: 'https://cdn-icons-png.flaticon.com/512/1946/1946488.png'
};

// Function to get icon based on app category or name
export const getAppIcon = (app) => {
  // If app has a specific thumbnail/icon URL, use it
  if (app.thumbnail && app.thumbnail.startsWith('http')) {
    return app.thumbnail;
  }
  
  // Get default icon based on category
  const category = app.category?.toLowerCase() || 'other';
  if (DEFAULT_ICONS[category]) {
    return DEFAULT_ICONS[category];
  }

  // Fallback to generating an icon with app initials
  const initials = app.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const colors = [
    '4CAF50', // Green
    '2196F3', // Blue
    'F44336', // Red
    'FFC107', // Amber
    '9C27B0', // Purple
    '00BCD4', // Cyan
  ];
  
  const colorIndex = Math.abs(app.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colors.length;
  const backgroundColor = colors[colorIndex];

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=128&background=${backgroundColor}&color=fff&bold=true&format=png`;
};
