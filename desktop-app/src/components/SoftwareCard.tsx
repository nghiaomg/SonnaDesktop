import { useState } from 'react';
import * as Select from '@radix-ui/react-select';
import * as Progress from '@radix-ui/react-progress';
import * as Dialog from '@radix-ui/react-dialog';
import { ChevronDown, Check, Download, Play, Square, Trash2, X } from 'lucide-react';
import type { Software, InstallProgress } from '../types/software';

interface SoftwareCardProps {
  software: Software;
  installedVersion?: string;
  isRunning?: boolean;
  progress: InstallProgress;
  onInstall: (software: Software, versionLabel: string) => void;
  onUninstall: (softwareId: string) => void;
  onStart: (softwareId: string) => void;
  onStop: (softwareId: string) => void;
}

export function SoftwareCard({
  software,
  installedVersion,
  isRunning,
  progress,
  onInstall,
  onUninstall,
  onStart,
  onStop,
}: SoftwareCardProps) {
  const [selectedVersion, setSelectedVersion] = useState(software.versions[0].label);
  const [showConfirm, setShowConfirm] = useState(false);
  const isInstalling = progress.status !== 'done' && progress.status !== undefined;
  const isInstalled = !!installedVersion;

  return (
    <div className={`software-card ${isRunning ? 'running' : ''}`}>
      <div className="card-header">
        <div className="card-info">
          <h3 className="card-title">{software.name}</h3>
          <p className="card-desc">{software.description}</p>
        </div>
        {isInstalled && (
          <span className={`status-badge ${isRunning ? 'running' : 'installed'}`}>
            {isRunning ? 'Running' : 'Installed'}
          </span>
        )}
      </div>

      {isInstalling && (
        <div className="progress-section">
          <div className="progress-header">
            <span className="progress-label">{progress.status}</span>
            <span className="progress-pct">{Math.round(progress.progress)}%</span>
          </div>
          <Progress.Root className="progress-root" value={progress.progress}>
            <Progress.Indicator className="progress-indicator" style={{ width: `${progress.progress}%` }} />
          </Progress.Root>
        </div>
      )}

      {!isInstalling && !isInstalled && (
        <div className="install-row">
          <Select.Root value={selectedVersion} onValueChange={setSelectedVersion}>
            <Select.Trigger className="select-trigger">
              <Select.Value />
              <Select.Icon>
                <ChevronDown size={16} />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="select-content" position="popper" sideOffset={4}>
                <Select.Viewport>
                  {software.versions.map((v) => (
                    <Select.Item key={v.label} value={v.label} className="select-item">
                      <Select.ItemText>{v.label}</Select.ItemText>
                      <Select.ItemIndicator className="select-indicator">
                        <Check size={14} />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>

          <button
            className="btn btn-primary"
            onClick={() => onInstall(software, selectedVersion)}
          >
            <Download size={16} />
            Install
          </button>
        </div>
      )}

      {isInstalled && (
        <div className="action-row">
          <div className="installed-info">
            <span className="installed-label">Version:</span>
            <span className="installed-version">{installedVersion}</span>
          </div>
          <div className="action-buttons">
            {isRunning ? (
              <button className="btn btn-danger" onClick={() => onStop(software.id)}>
                <Square size={16} />
                Stop
              </button>
            ) : (
              <button className="btn btn-success" onClick={() => onStart(software.id)}>
                <Play size={16} />
                Start
              </button>
            )}
            <Dialog.Root open={showConfirm} onOpenChange={setShowConfirm}>
              <Dialog.Trigger asChild>
                <button className="btn btn-ghost">
                  <Trash2 size={16} />
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="dialog-overlay" />
                <Dialog.Content className="dialog-content">
                  <Dialog.Title className="dialog-title">Confirm Uninstall</Dialog.Title>
                  <Dialog.Description className="dialog-desc">
                    Remove {software.name} {installedVersion} from your system?
                  </Dialog.Description>
                  <div className="dialog-actions">
                    <Dialog.Close asChild>
                      <button className="btn btn-secondary">Cancel</button>
                    </Dialog.Close>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        onUninstall(software.id);
                        setShowConfirm(false);
                      }}
                    >
                      Uninstall
                    </button>
                  </div>
                  <Dialog.Close asChild>
                    <button className="dialog-close" aria-label="Close">
                      <X size={18} />
                    </button>
                  </Dialog.Close>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </div>
      )}
    </div>
  );
}

