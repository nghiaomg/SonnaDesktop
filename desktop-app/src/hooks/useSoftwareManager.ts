import { useState, useCallback, useEffect } from 'react';
import type { AppPage, InstallProgress, Software, RunningService } from '../types/software';
import { SOFTWARE_DATA } from '../data/softwareData';

export function useSoftwareManager() {
  const [activePage, setActivePage] = useState<AppPage>('dashboard');
  const [installProgress, setInstallProgress] = useState<Record<string, InstallProgress>>({});
  const [installedList, setInstalledList] = useState<{ id: string; softwareId: string; version: string }[]>([]);
  const [runningIds, setRunningIds] = useState<string[]>([]);
  const [transitioningIds, setTransitioningIds] = useState<string[]>([]);
  const [isStoreLoaded, setIsStoreLoaded] = useState(false);

  // Persistence logic
  useEffect(() => {
    window.electronAPI?.store?.get('hardware.installedList').then((saved: unknown) => {
      if (Array.isArray(saved)) setInstalledList(saved);
      setIsStoreLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (isStoreLoaded) {
      window.electronAPI?.store?.set('hardware.installedList', installedList);
    }
  }, [installedList, isStoreLoaded]);

  // IPC Event Binding
  useEffect(() => {
    const handleProgress = (...args: unknown[]) => {
      const data = args[0] as { id: string, percent: number | string };

      setInstallProgress(prev => {
        const existing = prev[data.id] || { softwareId: data.id.split('_')[0], progress: 0, status: 'downloading' };

        if (data.percent === 'done') {
          return { ...prev, [data.id]: { ...existing, progress: 100, status: 'done' } };
        }
        if (data.percent === 'extracting') {
          return { ...prev, [data.id]: { ...existing, progress: 99, status: 'extracting' } };
        }
        return { ...prev, [data.id]: { ...existing, progress: data.percent as number, status: 'downloading' } };
      });

      if (data.percent === 'done') {
        const swId = data.id.split('_')[0];
        const verLabel = data.id.replace(`${swId}_`, '').replace(/_/g, '.');
        setInstalledList(prev => {
          if (prev.find(i => i.id === data.id)) return prev;
          return [...prev, { id: data.id, softwareId: swId, version: verLabel }];
        });
      }
    };

    window.electronAPI?.on('install-progress', handleProgress);
    return () => window.electronAPI?.off('install-progress', handleProgress);
  }, []);

  const install = useCallback((software: Software, versionLabel: string) => {
    const instanceId = `${software.id}_${versionLabel.replace(/\./g, '_')}`;
    const versionData = software.versions.find(v => v.label === versionLabel);
    if (!versionData) return;

    setInstallProgress((prev) => ({
      ...prev,
      [instanceId]: { softwareId: software.id, progress: 0, status: 'downloading' },
    }));

    window.electronAPI?.sys?.installSoftware({
      softwareId: software.id,
      version: versionLabel,
      url: versionData.url
    }).catch(console.error);
  }, []);

  const uninstall = useCallback((softwareId: string) => {
    setInstalledList((prev) => prev.filter((i) => i.id !== softwareId));
    setRunningIds((prev) => prev.filter((id) => id !== softwareId));
  }, []);

  const start = useCallback((instanceId: string) => {
    const item = installedList.find(i => i.id === instanceId);
    if (!item) return;

    setTransitioningIds(prev => [...prev, instanceId]);
    window.electronAPI?.sys?.startService(instanceId).then((success) => {
      setTransitioningIds(prev => prev.filter(id => id !== instanceId));
      if (success || !item.id.match(/^(apache|nginx|mysql|postgresql|mongodb)/)) {
        setRunningIds((prev) => (prev.includes(instanceId) ? prev : [...prev, instanceId]));
      }
    }).catch((err: Error | unknown) => {
      console.error(err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (err as any)?.message || String(err);
      if (msg && !msg.includes('user cancelled')) alert(msg.replace('Error: ', ''));
      setTransitioningIds(prev => prev.filter(id => id !== instanceId));
    });
  }, [installedList]);

  const stop = useCallback((instanceId: string) => {
    setTransitioningIds(prev => [...prev, instanceId]);
    window.electronAPI?.sys?.stopService(instanceId).then((success) => {
      setTransitioningIds(prev => prev.filter(id => id !== instanceId));
      if (success || !instanceId.match(/^(apache|nginx|mysql|postgresql|mongodb)/)) {
        setRunningIds((prev) => prev.filter((id) => id !== instanceId));
      }
    }).catch((err) => {
      console.error(err);
      setTransitioningIds(prev => prev.filter(id => id !== instanceId));
    });
  }, []);

  const services: RunningService[] = installedList.map((item) => {
    const software = SOFTWARE_DATA.find((s) => s.id === item.softwareId);
    return {
      id: item.id,
      softwareId: item.softwareId,
      name: software?.name ?? item.softwareId,
      version: item.version,
      icon: software?.icon,
      status: runningIds.includes(item.id) ? 'running' : 'stopped',
    };
  });

  return {
    activePage,
    setActivePage,
    installedList,
    runningIds,
    transitioningIds,
    services,
    progressMap: installProgress,
    install,
    uninstall,
    start,
    stop,
  };
}
