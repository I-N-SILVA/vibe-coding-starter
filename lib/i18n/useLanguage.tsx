'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, TranslationKey, translations } from './translations';

const STORAGE_KEY = 'plyaz_language';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey) => string;
    toggle: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
            if (stored === 'en' || stored === 'pt') {
                setLanguageState(stored);
            }
        } catch {
            // localStorage not available (SSR or restricted)
        }
    }, []);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch {
            // ignore
        }
    }, []);

    const toggle = useCallback(() => {
        setLanguage(language === 'en' ? 'pt' : 'en');
    }, [language, setLanguage]);

    const t = useCallback(
        (key: TranslationKey): string => {
            return translations[language][key] ?? translations['en'][key] ?? key;
        },
        [language],
    );

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, toggle }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage(): LanguageContextType {
    const ctx = useContext(LanguageContext);
    if (!ctx) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return ctx;
}
