const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { exec } = require('child_process');

let mainWindow;

function createWindow() {
  console.log('Creating window...');
  console.log('isDev:', isDev);

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      permissions: ['microphone']
    },
  });

  // Set permissions
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const url = webContents.getURL();
    
    if (permission === 'media') {
      // Auto-grant media access for our app
      callback(true);
      return;
    }

    // Deny all other permission requests
    callback(false);
  });

  // Set permission check handler
  session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
    return permission === 'media';
  });

  // Load the app
  const startUrl = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`;
  console.log('Loading URL:', startUrl);

  mainWindow.loadURL(startUrl)
    .then(() => {
      console.log('Window loaded successfully');
      // Open DevTools in development mode
      if (isDev) {
        mainWindow.webContents.openDevTools();
      }
    })
    .catch((err) => {
      console.error('Failed to load URL:', err);
    });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  console.log('App ready, creating window...');
  
  // Request microphone permission
  if (process.platform === 'win32') {
    try {
      await session.defaultSession.setPermission('media', 'granted', { origin: 'file://' });
      console.log('Microphone permission granted');
    } catch (error) {
      console.error('Error setting microphone permission:', error);
    }
  }
  
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Handle app opening
ipcMain.handle('open-app', async (event, appPath) => {
  try {
    console.log('Opening app:', appPath);
    return new Promise((resolve, reject) => {
      exec(`start "" "${appPath}"`, (error) => {
        if (error) {
          console.error('Error opening app:', error);
          reject(error);
        } else {
          console.log('App opened successfully');
          resolve(true);
        }
      });
    });
  } catch (error) {
    console.error('Error in open-app handler:', error);
    throw error;
  }
});

// Handle app closing
ipcMain.handle('close-app', async (event, appPath) => {
  try {
    console.log('Closing app:', appPath);
    return new Promise((resolve, reject) => {
      exec(`taskkill /IM "${path.basename(appPath)}" /F`, (error) => {
        if (error) {
          console.error('Error closing app:', error);
          reject(error);
        } else {
          console.log('App closed successfully');
          resolve(true);
        }
      });
    });
  } catch (error) {
    console.error('Error in close-app handler:', error);
    throw error;
  }
});
