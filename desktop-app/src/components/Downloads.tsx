import { useState } from 'react';
import * as Select from '@radix-ui/react-select';
import * as Progress from '@radix-ui/react-progress';
import { Download, ChevronDown, Check } from 'lucide-react';
import type { Software, InstallProgress, SoftwareCategory } from '../types/software';
import { SOFTWARE_DATA } from '../data/softwareData';
import { CategoryTabs } from './CategoryTabs';
import { useLanguage } from '../contexts/LanguageContext';

interface DownloadsProps {
  installedList: { id: string; softwareId: string; version: string }[];
  progressMap: Record<string, InstallProgress>;
  onInstall: (software: Software, versionLabel: string) => void;
}

export function Downloads({
  installedList,
  progressMap,
  onInstall,
}: DownloadsProps) {
  const [selectedVersion, setSelectedVersion] = useState<Record<string, string>>({});
  const [activeCategory, setActiveCategory] = useState<SoftwareCategory>('programming');
  const { t } = useLanguage();

  const getInstalledVersions = (softwareId: string) =>
    installedList.filter((i) => i.softwareId === softwareId).map(i => i.version);

  const getOngoingProgress = (softwareId: string) =>
    Object.values(progressMap).find(p => p.softwareId === softwareId && p.status !== 'done');

  return (
    <div className="downloads">
      <CategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      <div className="software-grid">
        {SOFTWARE_DATA.filter((s) => s.category === activeCategory).map((software) => {
          const installedVersions = getInstalledVersions(software.id);
          const availableVersions = software.versions.filter(v => !installedVersions.includes(v.label));
          const allInstalled = availableVersions.length === 0;

          const progDict = getOngoingProgress(software.id);
          const isInstalling = !!progDict;

          const currentVersion = selectedVersion[software.id] ?? availableVersions[0]?.label;

          return (
            <div key={software.id} className={`software-card ${allInstalled ? 'disabled' : ''}`} style={allInstalled ? { opacity: 0.6 } : {}}>
              <div className="card-header">
                <i className={`card-icon ${software.icon}`}></i>
                <div className="card-info">
                  <h3 className="card-title">{software.name}</h3>
                  <p className="card-desc">{software.description}</p>
                </div>
                {allInstalled && (
                  <span className="badge badge-installed">
                    Đã tải tất cả
                  </span>
                )}
              </div>

              {isInstalling && progDict && (
                <div className="progress-section">
                  <div className="progress-header">
                    <span className="progress-status">
                      {progDict.status === 'downloading' ? t('action.downloading')
                        : progDict.status === 'extracting' ? t('action.extracting')
                          : progDict.status === 'configuring' ? t('action.configuring')
                            : progDict.status}
                    </span>
                    <span className="progress-pct">{Math.round(progDict.progress)}%</span>
                  </div>
                  <Progress.Root className="progress-root">
                    <Progress.Indicator
                      className="progress-indicator"
                      style={{ width: `${progDict.progress}%` }}
                    />
                  </Progress.Root>
                </div>
              )}

              {!isInstalling && !allInstalled && (
                <div className="install-row">
                  <Select.Root
                    value={currentVersion}
                    onValueChange={(v) => setSelectedVersion((p) => ({ ...p, [software.id]: v }))}
                  >
                    <Select.Trigger className="select-trigger">
                      <Select.Value />
                      <Select.Icon>
                        <ChevronDown size={16} />
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="select-content" position="popper" sideOffset={4}>
                        <Select.Viewport>
                          {availableVersions.map((v) => (
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
                    onClick={() => onInstall(software, currentVersion)}
                  >
                    <Download size={16} />
                    {t('downloads.card.install')}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
