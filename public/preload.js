const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    isElectron: true,
    platform: process.platform,
    // App operations
    openApp: async (appPath) => {
      try {
        console.log('Preload: Attempting to open app:', appPath);
        const result = await ipcRenderer.invoke('open-app', appPath);
        console.log('Preload: Open app result:', result);
        return result;
      } catch (error) {
        console.error('Preload: Error opening app:', error);
        throw error;
      }
    },
    closeApp: async (appPath) => {
      try {
        console.log('Preload: Attempting to close app:', appPath);
        const result = await ipcRenderer.invoke('close-app', appPath);
        console.log('Preload: Close app result:', result);
        return result;
      } catch (error) {
        console.error('Preload: Error closing app:', error);
        throw error;
      }
    },
    // IPC communication
    invoke: (channel, data) => {
      const validChannels = [
        'check-microphone-permission',
        'request-microphone-permission',
        'open-app',
        'close-app'
      ];
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, data);
      }
      throw new Error(`Invalid channel: ${channel}`);
    },
    send: (channel, data) => {
      ipcRenderer.send(channel, data);
    },
    receive: (channel, func) => {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
    // Version info
    getVersions: () => {
      return process.versions;
    }
  }
);
