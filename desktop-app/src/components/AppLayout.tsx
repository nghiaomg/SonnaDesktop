import { useState, useEffect } from 'react';
import { type AppPage } from '../types/software';
import { LayoutDashboard, Download, Settings as SettingsIcon, Terminal as TerminalIcon, Loader2 } from 'lucide-react';
import { TitleBar } from './TitleBar';
import { useLanguage } from '../contexts/LanguageContext';

interface AppLayoutProps {
  children: React.ReactNode;
  activePage: AppPage;
  onPageChange: (page: AppPage) => void;
}

export function AppLayout({ children, activePage, onPageChange }: AppLayoutProps) {
  const { t } = useLanguage();
  const [terminalState, setTerminalState] = useState<'idle' | 'downloading' | 'extracting' | 'done'>('idle');

  useEffect(() => {
    const handleProgress = (...args: unknown[]) => {
      const data = args[0] as { status: string };
      setTerminalState(data.status as 'idle' | 'downloading' | 'extracting' | 'done');
    };
    window.electronAPI?.on('terminal-progress', handleProgress);
    return () => window.electronAPI?.off('terminal-progress', handleProgress);
  }, []);

  const handleOpenTerminal = async () => {
    if (terminalState !== 'idle' && terminalState !== 'done') return;
    try {
      setTerminalState('downloading');
      await window.electronAPI?.sys?.openTerminal();
    } catch (err) {
      console.error(err);
    } finally {
      setTerminalState('idle');
    }
  };

  const NAV_ITEMS: { id: AppPage; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: t('app.dashboard'), icon: <LayoutDashboard size={20} /> },
    { id: 'downloads', label: t('app.downloads'), icon: <Download size={20} /> },
  ];

  return (
    <div className="app-layout">
      <TitleBar />

      <div className="top-nav-bar">
        <nav className="top-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`top-nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => onPageChange(item.id)}
            >
              {item.icon}
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            className="top-nav-item"
            onClick={handleOpenTerminal}
            style={{ padding: '8px 12px', marginRight: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-primary)' }}
            title={t('app.terminal')}
          >
            {terminalState === 'idle' || terminalState === 'done' ? (
              <TerminalIcon size={20} />
            ) : (
              <Loader2 size={20} className="animate-spin" />
            )}
            {terminalState === 'downloading' && <span style={{ fontSize: '11px', marginLeft: '6px' }}>Downloading...</span>}
            {terminalState === 'extracting' && <span style={{ fontSize: '11px', marginLeft: '6px' }}>Extracting...</span>}
          </button>
          <button
            className={`top-nav-item ${activePage === 'settings' ? 'active' : ''}`}
            onClick={() => onPageChange('settings')}
            style={{ padding: '8px 12px', marginRight: '16px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-primary)' }}
            title={t('app.settings')}
          >
            <SettingsIcon size={20} />
          </button>
        </div>
      </div>

      <div className="app-body">
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
