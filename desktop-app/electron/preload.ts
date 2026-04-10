import { ipcRenderer, contextBridge } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),

  // Window state events
  onMaximizeChange: (callback: (isMaximized: boolean) => void) => {
    ipcRenderer.on('window-maximized', (_event, isMaximized) => callback(isMaximized));
  },

  // IPC
  send: (channel: string, ...args: unknown[]) => ipcRenderer.send(channel, ...args),
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    ipcRenderer.on(channel, (_event, ...args) => callback(...args));
  },
  invoke: (channel: string, ...args: unknown[]) => ipcRenderer.invoke(channel, ...args),
  off: (channel: string, callback: (...args: unknown[]) => void) => {
    ipcRenderer.removeListener(channel, callback);
  },

  // Store
  store: {
    get: (key: string) => ipcRenderer.invoke('store-get', key),
    set: (key: string, value: unknown) => ipcRenderer.invoke('store-set', key, value),
  },

  // System
  sys: {
    getAppMemory: () => ipcRenderer.invoke('get-app-memory'),
    openTerminal: () => ipcRenderer.invoke('open-terminal'),
    clearCache: () => ipcRenderer.invoke('clear-cache'),
    getCacheSize: () => ipcRenderer.invoke('get-cache-size'),
    installSoftware: (payload: { softwareId: string, version: string, url: string }) => ipcRenderer.invoke('install-software', payload),
    startService: (instanceId: string) => ipcRenderer.invoke('start-service', instanceId),
    stopService: (instanceId: string) => ipcRenderer.invoke('stop-service', instanceId),
    openServiceDir: (instanceId: string) => ipcRenderer.invoke('open-service-dir', instanceId),
  }
})
