// Default icons for different app categories
export const DEFAULT_ICONS = {
  productivity: 'https://cdn-icons-png.flaticon.com/512/2620/2620576.png',
  communication: 'https://cdn-icons-png.flaticon.com/512/1946/1946429.png',
  development: 'https://cdn-icons-png.flaticon.com/512/1087/1087927.png',
  design: 'https://cdn-icons-png.flaticon.com/512/681/681662.png',
  social: 'https://cdn-icons-png.flaticon.com/512/1968/1968666.png',
  entertainment: 'https://cdn-icons-png.flaticon.com/512/2991/2991606.png',
  business: 'https://cdn-icons-png.flaticon.com/512/1087/1087932.png',
  education: 'https://cdn-icons-png.flaticon.com/512/2436/2436874.png',
  default: 'https://cdn-icons-png.flaticon.com/512/2521/2521826.png'
};

// Function to get icon based on app category or name
export const getAppIcon = (app) => {
  if (app.thumbnail) {
    return app.thumbnail;
  }
  
  if (app.category && DEFAULT_ICONS[app.category.toLowerCase()]) {
    return DEFAULT_ICONS[app.category.toLowerCase()];
  }

  // Fallback to default icon with app name initials
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(app.name)}&size=512&background=random&color=fff&bold=true&format=svg`;
};
