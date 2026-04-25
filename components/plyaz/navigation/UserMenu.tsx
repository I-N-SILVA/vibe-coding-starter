'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor, Globe, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useLanguage, type Locale } from '@/components/providers';

const LOCALES: { value: Locale; flag: string; label: string }[] = [
    { value: 'en', flag: '🇬🇧', label: 'English' },
    { value: 'pt', flag: '🇧🇷', label: 'Português' },
    { value: 'es', flag: '🇪🇸', label: 'Español' },
    { value: 'fr', flag: '🇫🇷', label: 'Français' },
];

export function UserMenu() {
    const { profile, signOut } = useAuth();
    const { theme, setTheme } = useTheme();
    const { locale, setLocale } = useLanguage();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const initials = profile?.full_name
        ? profile.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
        : '?';

    const currentLocale = LOCALES.find((l) => l.value === locale) ?? LOCALES[0];

    const themeOptions = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
    ] as const;

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 h-9 pl-1 pr-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="User menu"
            >
                <div className="w-7 h-7 rounded-lg bg-orange-600 flex items-center justify-center text-[10px] font-black text-white flex-shrink-0">
                    {initials}
                </div>
                <ChevronDown className={`w-3 h-3 text-neutral-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-100 dark:border-neutral-800 z-50 overflow-hidden"
                    >
                        {/* Profile header */}
                        <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
                            <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">{profile?.full_name ?? 'Player'}</p>
                            <p className="text-[10px] text-neutral-400 truncate">{profile?.email ?? ''}</p>
                        </div>

                        {/* Profile link */}
                        <button
                            onClick={() => { setOpen(false); router.push('/league/player/profile'); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left"
                        >
                            <User className="w-4 h-4 text-neutral-400" />
                            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Profile Settings</span>
                        </button>

                        {/* Theme */}
                        <div className="px-4 py-2.5 border-t border-neutral-100 dark:border-neutral-800">
                            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Appearance</p>
                            <div className="flex gap-1">
                                {themeOptions.map(({ value, icon: Icon, label }) => (
                                    <button
                                        key={value}
                                        onClick={() => setTheme(value)}
                                        title={label}
                                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
                                            theme === value
                                                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                                                : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                                        }`}
                                    >
                                        <Icon className="w-3 h-3" />
                                        <span className="hidden sm:inline">{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Language */}
                        <div className="px-4 py-2.5 border-t border-neutral-100 dark:border-neutral-800">
                            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                <Globe className="w-3 h-3" /> Language
                            </p>
                            <div className="grid grid-cols-2 gap-1">
                                {LOCALES.map((l) => (
                                    <button
                                        key={l.value}
                                        onClick={() => setLocale(l.value)}
                                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
                                            locale === l.value
                                                ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                                                : 'text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                                        }`}
                                    >
                                        <span>{l.flag}</span>
                                        <span>{l.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sign out */}
                        <div className="border-t border-neutral-100 dark:border-neutral-800">
                            <button
                                onClick={() => { setOpen(false); signOut(); }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left group"
                            >
                                <LogOut className="w-4 h-4 text-neutral-400 group-hover:text-red-500 transition-colors" />
                                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 group-hover:text-red-500 transition-colors">Sign out</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
