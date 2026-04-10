import { useState, useEffect } from 'react';
import * as Select from '@radix-ui/react-select';
import { Play, Square, Trash2, PackageOpen, ChevronDown, Check, FolderOpen, Loader2 } from 'lucide-react';
import type { RunningService } from '../types/software';
import type { TranslationKey } from '../i18n/translations';
import { useLanguage } from '../contexts/LanguageContext';
import { SOFTWARE_DATA } from '../data/softwareData';

interface DashboardProps {
  services: RunningService[];
  onStart: (serviceId: string) => void;
  onStop: (serviceId: string) => void;
  onRemove: (serviceId: string) => void;
  transitioningIds: string[];
}

export function Dashboard({ services, onStart, onStop, onRemove, transitioningIds }: DashboardProps) {
  const { t } = useLanguage();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [appMemory, setAppMemory] = useState<string>('0.0');
  const [activeDashboardId, setActiveDashboardId] = useState<Record<string, string>>({});

  useEffect(() => {
    window.electronAPI?.store?.get('dashboard.selectedServices').then((saved: unknown) => {
      if (Array.isArray(saved)) setSelectedIds(saved);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchMemory = async () => {
      try {
        const mem = await window.electronAPI?.sys?.getAppMemory();
        if (mem) setAppMemory(mem);
      } catch (err) {
        console.error('Failed to fetch app memory:', err);
      }
    };
    fetchMemory();
    const interval = setInterval(fetchMemory, 2000);
    return () => clearInterval(interval);
  }, []);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      window.electronAPI?.store?.set('dashboard.selectedServices', next).catch(console.error);
      return next;
    });
  };

  const handleQuickStart = () => {
    selectedIds.forEach(id => {
      const s = services.find(x => x.id === id);
      if (s && s.status !== 'running') onStart(id);
    });
  };

  const handleStopSelected = () => {
    selectedIds.forEach(id => {
      const s = services.find(x => x.id === id);
      if (s && s.status === 'running') onStop(id);
    });
  };

  const selectedRunningCount = selectedIds.filter(id => services.find(x => x.id === id)?.status === 'running').length;
  const isAnySelectedRunning = selectedIds.length > 0 && selectedRunningCount > 0;
  const isAnySelectedTransitioning = selectedIds.some(id => transitioningIds.includes(id));

  // Filter out programming languages from being considered in the global start/stop toggle since they don't have daemon states
  const daemonServices = services.filter(s => {
    const cat = SOFTWARE_DATA.find(def => def.id === s.softwareId)?.category;
    return cat !== 'programming' && cat !== 'nodejs';
  });

  const programmingItems = services.filter(s => {
    const cat = SOFTWARE_DATA.find(def => def.id === s.softwareId)?.category;
    return cat === 'programming' || cat === 'nodejs';
  });

  const renderGrid = (items: RunningService[]) => {
    if (items.length === 0) {
      return (
        <div className="empty-services" style={{ gridColumn: '1 / -1', padding: '32px' }}>
          <PackageOpen size={48} className="empty-icon" strokeWidth={1} style={{ opacity: 0.5, marginBottom: '16px' }} />
          <p className="empty-title" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{t('dashboard.empty.title')}</p>
        </div>
      );
    }

    return (
      <div className="software-grid" style={{ marginBottom: '32px' }}>
        {Object.entries(items.reduce((acc, service) => {
          if (!acc[service.softwareId]) acc[service.softwareId] = [];
          acc[service.softwareId].push(service);
          return acc;
        }, {} as Record<string, RunningService[]>)).map(([softwareId, serviceGroup]) => {
          const isProgramming = SOFTWARE_DATA.find(def => def.id === softwareId)?.category === 'programming';
          const runningService = serviceGroup.find(s => s.status === 'running');
          const activeId = runningService?.id || activeDashboardId[softwareId] || serviceGroup[0].id;
          const activeService = serviceGroup.find(s => s.id === activeId) || serviceGroup[0];
          const isTransitioning = transitioningIds.includes(activeId);

          return (
            <div key={softwareId} className={`software-card ${activeService.status === 'running' || isProgramming ? 'running' : ''}`}>
              <div className="card-header" style={{ alignItems: 'center' }}>
                {!isProgramming && (
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(activeId)}
                    onChange={() => toggleSelection(activeId)}
                    style={{ cursor: 'pointer', margin: 0, transform: 'scale(1.2)' }}
                  />
                )}
                <i className={`card-icon ${activeService.icon}`} style={{ marginLeft: isProgramming ? '0' : '12px' }}></i>
                <div className="card-info">
                  <h3 className="card-title">{activeService.name}</h3>
                  {serviceGroup.length > 1 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {t('dashboard.version')}
                      <Select.Root
                        value={activeId}
                        onValueChange={(v) => {
                          if (!runningService) {
                            setActiveDashboardId(prev => ({ ...prev, [softwareId]: v }));
                            if (selectedIds.includes(activeId)) {
                              setSelectedIds(prev => [...prev.filter(id => id !== activeId), v]);
                            }
                          }
                        }}
                        disabled={!!runningService}
                      >
                        <Select.Trigger className="select-trigger" style={{ height: 'auto', padding: '2px 8px', fontSize: '12px', minHeight: 'unset', width: 'auto', gap: '4px' }}>
                          <Select.Value />
                          <Select.Icon><ChevronDown size={14} /></Select.Icon>
                        </Select.Trigger>
                        <Select.Portal>
                          <Select.Content className="select-content" position="popper" sideOffset={4}>
                            <Select.Viewport>
                              {serviceGroup.map((s) => (
                                <Select.Item key={s.id} value={s.id} className="select-item" style={{ padding: '4px 12px', fontSize: '12px' }}>
                                  <Select.ItemText>{s.version}</Select.ItemText>
                                  <Select.ItemIndicator className="select-indicator"><Check size={12} /></Select.ItemIndicator>
                                </Select.Item>
                              ))}
                            </Select.Viewport>
                          </Select.Content>
                        </Select.Portal>
                      </Select.Root>
                    </div>
                  ) : (
                    <p className="card-desc">{t('dashboard.version')}{activeService.version}</p>
                  )}
                </div>
                <span className={`badge ${activeService.status === 'running' || isProgramming ? 'badge-running' : 'badge-installed'}`}>
                  {isProgramming ? t('downloads.card.installed') : (activeService.status === 'running' ? t('dashboard.status.running') : t('dashboard.status.stopped'))}
                </span>
              </div>

              <div className="action-row">
                <div className="action-buttons" style={{ width: '100%', justifyContent: 'flex-end', display: 'flex', gap: '8px' }}>
                  <button className="btn btn-ghost" onClick={() => window.electronAPI?.sys?.openServiceDir(activeId)} title={t('action.openDir' as TranslationKey)} style={{ padding: '6px' }}>
                    <FolderOpen size={16} />
                  </button>
                  {!isProgramming && (
                    activeService.status === 'running' ? (
                      <button className="btn btn-stop" onClick={() => onStop(activeId)} disabled={isTransitioning}>
                        {isTransitioning ? <Loader2 size={16} className="spinner" /> : <Square size={16} />}
                        {t('action.stop')}
                      </button>
                    ) : (
                      <button className="btn btn-start" onClick={() => onStart(activeId)} disabled={isTransitioning}>
                        {isTransitioning ? <Loader2 size={16} className="spinner" /> : <Play size={16} />}
                        {t('action.start')}
                      </button>
                    )
                  )}
                  <button className="btn btn-remove" onClick={() => onRemove(activeId)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    );
  };

  return (
    <div className="dashboard">
      {daemonServices.length > 0 && (
        <div className="dashboard-global-actions" style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="app-memory-stats" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>RAM:</span> {appMemory} MB
          </div>
          {isAnySelectedRunning ? (
            <button className="btn btn-stop" onClick={handleStopSelected} disabled={selectedIds.length === 0 || isAnySelectedTransitioning}>
              {isAnySelectedTransitioning ? <Loader2 size={16} className="spinner" /> : <Square size={16} />}
              {t('dashboard.stopSelected' as TranslationKey)}
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleQuickStart} disabled={selectedIds.length === 0 || isAnySelectedTransitioning}>
              {isAnySelectedTransitioning ? <Loader2 size={16} className="spinner" /> : <Play size={16} />}
              {t('dashboard.quickStart' as TranslationKey)}
            </button>
          )}
        </div>
      )}

      <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '24px 0 16px', color: 'var(--text-primary)' }}>
        {t('dashboard.sections.services' as TranslationKey)}
      </h2>
      {renderGrid(daemonServices)}

      <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '24px 0 16px', color: 'var(--text-primary)' }}>
        {t('dashboard.sections.languages' as TranslationKey)}
      </h2>
      {renderGrid(programmingItems)}
    </div>
  );
}
