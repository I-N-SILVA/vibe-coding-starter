'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import en from '../../messages/en.json';
import pt from '../../messages/pt.json';
import es from '../../messages/es.json';
import fr from '../../messages/fr.json';

export type Locale = 'en' | 'pt' | 'es' | 'fr';

const MESSAGES: Record<Locale, typeof en> = { en, pt, es, fr };
const STORAGE_KEY = 'plyaz_locale';

type NestedMessages = typeof en;

// Dot-path accessor: t('player.dashboard.title')
function get(obj: Record<string, unknown>, path: string): string {
    const parts = path.split('.');
    let cur: unknown = obj;
    for (const part of parts) {
        if (cur == null || typeof cur !== 'object') return path;
        cur = (cur as Record<string, unknown>)[part];
    }
    return typeof cur === 'string' ? cur : path;
}

interface LanguageContextValue {
    locale: Locale;
    setLocale: (l: Locale) => void;
    t: (key: string) => string;
    messages: NestedMessages;
}

const LanguageContext = createContext<LanguageContextValue>({
    locale: 'en',
    setLocale: () => {},
    t: (k) => k,
    messages: en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('en');

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
            if (stored && stored in MESSAGES) setLocaleState(stored);
        } catch { /* ssr */ }
    }, []);

    const setLocale = useCallback((l: Locale) => {
        setLocaleState(l);
        try { localStorage.setItem(STORAGE_KEY, l); } catch { /* ssr */ }
    }, []);

    const messages = MESSAGES[locale];

    const t = useCallback(
        (key: string) => get(messages as unknown as Record<string, unknown>, key),
        [messages]
    );

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t, messages }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
