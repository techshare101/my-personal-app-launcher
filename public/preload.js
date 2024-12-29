const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    isElectron: true,
    openApp: (path) => ipcRenderer.invoke('open-app', path),
    closeApp: (path) => ipcRenderer.invoke('close-app', path)
  }
);
