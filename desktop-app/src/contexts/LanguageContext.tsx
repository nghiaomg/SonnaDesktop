/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppLanguage, translations, TranslationKey } from '../i18n/translations';

interface LanguageContextType {
    language: AppLanguage;
    setLanguage: (lang: AppLanguage) => void;
    t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    // Use 'en' as default language
    const [language, setLanguageState] = useState<AppLanguage>('en');

    useEffect(() => {
        window.electronAPI?.store?.get('settings.language').then((savedLang: unknown) => {
            if (savedLang === 'en' || savedLang === 'vi') {
                setLanguageState(savedLang as AppLanguage);
            }
        }).catch(console.error);
    }, []);

    const setLanguage = (lang: AppLanguage) => {
        setLanguageState(lang);
        window.electronAPI?.store?.set('settings.language', lang).catch(console.error);
    };

    const t = (key: TranslationKey): string => {
        return translations[language][key] || translations['en'][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
