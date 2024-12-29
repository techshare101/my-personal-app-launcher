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
    // File operations
    openFile: (filePath) => {
      ipcRenderer.send('open-file', filePath);
    },
    // App operations
    openApp: (appPath) => {
      ipcRenderer.send('open-app', appPath);
    },
    closeApp: (appPath) => {
      ipcRenderer.send('close-app', appPath);
    },
    // IPC communication
    invoke: (channel, data) => {
      if (channel === 'check-microphone-permission' || 
          channel === 'request-microphone-permission') {
        return ipcRenderer.invoke(channel, data);
      }
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
