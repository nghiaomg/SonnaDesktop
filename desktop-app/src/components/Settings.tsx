import { useState, useEffect } from 'react';
import * as Select from '@radix-ui/react-select';
import * as Progress from '@radix-ui/react-progress';
import { Settings as SettingsIcon, Monitor, LogOut, Globe, ChevronDown, Check, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { AppLanguage } from '../i18n/translations';

export function Settings() {
    const { language, setLanguage, t } = useLanguage();
    const [cacheSize, setCacheSize] = useState<string>('0.00');
    const [cacheProgress, setCacheProgress] = useState<number | null>(null);

    useEffect(() => {
        window.electronAPI?.sys?.getCacheSize?.()
            .then(size => setCacheSize(size))
            .catch(console.error);
    }, []);

    const handleClearCache = async () => {
        if (cacheProgress !== null) return;
        setCacheProgress(0);

        const interval = setInterval(() => {
            setCacheProgress(prev => Math.min((prev ?? 0) + 15, 95));
        }, 100);

        try {
            await window.electronAPI?.sys?.clearCache();
        } finally {
            clearInterval(interval);
            setCacheProgress(100);
            setTimeout(() => {
                setCacheProgress(null);
                setCacheSize('0.00');
            }, 600);
        }
    };

    return (
        <div className="settings-page" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '2rem' }}>
            <div style={{ paddingBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <SettingsIcon size={28} />
                    {t('settings.title')}
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                    {t('settings.desc')}
                </p>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Globe size={20} />
                        <div>
                            <h4 style={{ fontWeight: 500 }}>{t('settings.lang.title')}</h4>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t('settings.lang.desc')}</p>
                        </div>
                    </div>
                    <Select.Root
                        value={language}
                        onValueChange={(v) => setLanguage(v as AppLanguage)}
                    >
                        <Select.Trigger className="select-trigger" style={{ flex: 'none', width: 'fit-content', gap: '8px' }}>
                            <Select.Value />
                            <Select.Icon>
                                <ChevronDown size={16} />
                            </Select.Icon>
                        </Select.Trigger>
                        <Select.Portal>
                            <Select.Content className="select-content" position="popper" sideOffset={4}>
                                <Select.Viewport>
                                    <Select.Item value="en" className="select-item">
                                        <Select.ItemText>English (US)</Select.ItemText>
                                        <Select.ItemIndicator className="select-indicator">
                                            <Check size={14} />
                                        </Select.ItemIndicator>
                                    </Select.Item>
                                    <Select.Item value="vi" className="select-item">
                                        <Select.ItemText>Tiếng Việt (VN)</Select.ItemText>
                                        <Select.ItemIndicator className="select-indicator">
                                            <Check size={14} />
                                        </Select.ItemIndicator>
                                    </Select.Item>
                                </Select.Viewport>
                            </Select.Content>
                        </Select.Portal>
                    </Select.Root>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Monitor size={20} />
                        <div>
                            <h4 style={{ fontWeight: 500 }}>{t('settings.theme.title')}</h4>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t('settings.theme.desc')}</p>
                        </div>
                    </div>
                    <button className="btn btn-ghost" disabled>{t('settings.theme.action')}</button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Trash2 size={20} />
                        <div>
                            <h4 style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {t('settings.cache.title')}
                                {cacheProgress === null && (
                                    <span style={{ fontSize: '12px', background: 'var(--bg-hover)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                                        {cacheSize} MB
                                    </span>
                                )}
                            </h4>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t('settings.cache.desc')}</p>
                        </div>
                    </div>
                    {cacheProgress !== null ? (
                        <div style={{ width: '150px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                <span>{t('action.cleaning')}</span>
                                <span>{Math.round(cacheProgress)}%</span>
                            </div>
                            <Progress.Root className="progress-root" style={{ height: '6px', background: 'var(--bg-hover)', borderRadius: '99px', overflow: 'hidden' }}>
                                <Progress.Indicator
                                    className="progress-indicator"
                                    style={{ width: `${cacheProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.2s ease' }}
                                />
                            </Progress.Root>
                        </div>
                    ) : (
                        <button className="btn btn-secondary" onClick={handleClearCache}>
                            {t('settings.cache.action')}
                        </button>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <LogOut size={20} />
                        <div>
                            <h4 style={{ fontWeight: 500 }}>{t('settings.shutdown.title')}</h4>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t('settings.shutdown.desc')}</p>
                        </div>
                    </div>
                    <button className="btn btn-stop">{t('settings.shutdown.action')}</button>
                </div>
            </div>
        </div>
    );
}
