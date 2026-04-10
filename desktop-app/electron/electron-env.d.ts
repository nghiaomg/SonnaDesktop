/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    APP_ROOT: string
    VITE_PUBLIC: string
  }
}

interface ElectronAPI {
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
  onMaximizeChange: (callback: (isMaximized: boolean) => void) => void;
  send: (channel: string, ...args: unknown[]) => void;
  on: (channel: string, callback: (...args: unknown[]) => void) => void;
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
  off: (channel: string, callback: (...args: unknown[]) => void) => void;
  store: {
    get: (key: string) => Promise<unknown>;
    set: (key: string, value: unknown) => Promise<void>;
  };
  sys: {
    getAppMemory: () => Promise<string>;
    openTerminal: () => Promise<boolean>;
    clearCache: () => Promise<boolean>;
    getCacheSize: () => Promise<string>;
    installSoftware: (payload: { softwareId: string, version: string, url: string }) => Promise<string>;
    startService: (instanceId: string) => Promise<boolean>;
    stopService: (instanceId: string) => Promise<boolean>;
    openServiceDir: (instanceId: string) => Promise<boolean>;
  };
}

interface Window {
  electronAPI: ElectronAPI;
  ipcRenderer: {
    on: (...args: unknown[]) => unknown;
    off: (...args: unknown[]) => unknown;
    send: (...args: unknown[]) => unknown;
    invoke: (...args: unknown[]) => unknown;
  };
}
