const { app, BrowserWindow, ipcMain, session, systemPreferences } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { exec } = require('child_process');

let mainWindow;

// Request microphone access before creating window
const requestMicrophoneAccess = async () => {
  if (process.platform === 'win32') {
    try {
      // Check if microphone devices are available
      const devices = await require('electron').systemPreferences.getMediaAccessStatus('microphone');
      if (devices === 'not-determined') {
        console.log('No microphone devices found');
        return false;
      }

      // Check if we have microphone access
      const hasAccess = systemPreferences.getMediaAccessStatus('microphone');
      console.log('Current microphone access status:', hasAccess);
      
      if (hasAccess !== 'granted') {
        // Request access
        const granted = await systemPreferences.askForMediaAccess('microphone');
        console.log('Microphone access granted:', granted);
        
        // Double check the permission after granting
        const finalStatus = systemPreferences.getMediaAccessStatus('microphone');
        if (finalStatus !== 'granted') {
          console.error('Microphone permission not properly granted:', finalStatus);
          return false;
        }
        return granted;
      }
      return true;
    } catch (error) {
      console.error('Error requesting microphone access:', error);
      return false;
    }
  }
  return true;
};

function createWindow() {
  console.log('Creating window...');

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

  // Configure session permissions
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const url = webContents.getURL();
    console.log('Permission request:', { permission, url });

    if (permission === 'media' || permission === 'microphone') {
      // Check if microphone is actually available
      const micStatus = systemPreferences.getMediaAccessStatus('microphone');
      if (micStatus === 'not-determined') {
        console.error('No microphone devices found');
        callback(false);
        return;
      }
      callback(true);
      return;
    }

    callback(false);
  });

  session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
    return permission === 'media' || permission === 'microphone';
  });

  // Load the app
  const startUrl = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`;
  console.log('Loading URL:', startUrl);

  mainWindow.loadURL(startUrl)
    .then(() => {
      console.log('Window loaded successfully');
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

  // Handle IPC messages
  ipcMain.handle('check-microphone-permission', async () => {
    try {
      const status = systemPreferences.getMediaAccessStatus('microphone');
      console.log('Microphone permission status:', status);
      return status;
    } catch (error) {
      console.error('Error checking microphone permission:', error);
      return 'denied';
    }
  });

  ipcMain.handle('request-microphone-permission', async () => {
    try {
      const granted = await requestMicrophoneAccess();
      console.log('Microphone permission granted:', granted);
      return granted;
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      return false;
    }
  });
}

app.whenReady().then(async () => {
  console.log('App ready, requesting microphone access...');
  
  try {
    // Request microphone access first
    const granted = await requestMicrophoneAccess();
    console.log('Initial microphone access:', granted);
    
    // Create window regardless of permission
    createWindow();
  } catch (error) {
    console.error('Error during startup:', error);
    createWindow();
  }
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

// Handle app operations
ipcMain.handle('open-app', async (event, appPath) => {
  return new Promise((resolve, reject) => {
    exec(`start "" "${appPath}"`, (error) => {
      if (error) {
        console.error('Error opening app:', error);
        reject(error);
      } else {
        resolve(true);
      }
    });
  });
});

ipcMain.handle('close-app', async (event, appPath) => {
  return new Promise((resolve, reject) => {
    const appName = path.basename(appPath, path.extname(appPath));
    exec(`taskkill /IM "${appName}.exe" /F`, (error) => {
      if (error) {
        // Don't reject on error as the app might not be running
        console.log('App might not be running:', error);
      }
      resolve(true);
    });
  });
});
