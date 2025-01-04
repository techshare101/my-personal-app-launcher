// Check if we're running in Electron
export const isElectron = () => {
  return window?.electron?.isElectron === true;
};

// Check if we're running in production
export const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

// Check if we're running in development
export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};

// Check if we're running in the web
export const isWeb = () => {
  return !isElectron();
};
