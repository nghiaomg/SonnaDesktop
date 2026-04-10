export type AppPage = 'dashboard' | 'downloads' | 'settings';

export type SoftwareCategory =
  | 'programming'
  | 'webserver'
  | 'nodejs'
  | 'database';

export interface SoftwareVersion {
  label: string;
  url: string;
}

export interface Software {
  id: string;
  name: string;
  category: SoftwareCategory;
  description: string;
  versions: SoftwareVersion[];
  icon?: string;
}

export interface InstallProgress {
  softwareId: string;
  progress: number;
  status: 'downloading' | 'extracting' | 'configuring' | 'done' | 'error';
  error?: string;
}

export interface RunningService {
  id: string; // The compound instance ID (e.g., php_8_4_12)
  softwareId: string; // The underlying software type (e.g., php)
  name: string;
  version: string;
  icon?: string;
  status: 'running' | 'stopped';
  startTime?: Date;
  port?: number;
}
