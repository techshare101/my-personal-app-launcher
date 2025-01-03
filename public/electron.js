const { app, BrowserWindow, ipcMain, session, systemPreferences } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
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
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the index.html from a url
  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  console.log('Loading URL:', startUrl);
  mainWindow.loadURL(startUrl);

  // Open the DevTools in development.
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    mainWindow = null;
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
  console.log('Attempting to open app:', appPath);
  
  try {
    // Validate app path
    if (!appPath) {
      throw new Error('No app path provided');
    }

    // Check if path exists
    if (!require('fs').existsSync(appPath)) {
      throw new Error(`App path does not exist: ${appPath}`);
    }

    return new Promise((resolve, reject) => {
      // Use start command on Windows to launch apps
      const command = process.platform === 'win32' 
        ? `start "" "${appPath}"`
        : `"${appPath}"`;

      exec(command, { shell: true }, (error, stdout, stderr) => {
        if (error) {
          console.error('Error opening app:', error);
          console.error('stderr:', stderr);
          reject(new Error(`Failed to open app: ${error.message}`));
        } else {
          console.log('App opened successfully');
          console.log('stdout:', stdout);
          resolve(true);
        }
      });
    });
  } catch (error) {
    console.error('Error in open-app handler:', error);
    throw error;
  }
});

ipcMain.handle('close-app', async (event, appPath) => {
  console.log('Attempting to close app:', appPath);
  
  try {
    if (!appPath) {
      throw new Error('No app path provided');
    }

    const appName = path.basename(appPath, path.extname(appPath));
    console.log('Closing app with name:', appName);

    return new Promise((resolve, reject) => {
      exec(`taskkill /IM "${appName}.exe" /F`, (error, stdout, stderr) => {
        if (error) {
          // Don't reject on error as the app might not be running
          console.log('App might not be running:', error);
          console.log('stderr:', stderr);
        }
        console.log('Close app result:', stdout);
        resolve(true);
      });
    });
  } catch (error) {
    console.error('Error in close-app handler:', error);
    throw error;
  }
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
