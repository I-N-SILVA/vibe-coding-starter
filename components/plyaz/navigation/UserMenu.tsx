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

    const themeOptions = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
    ] as const;

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 h-10 pl-1.5 pr-2.5 rounded-2xl hover:bg-neutral-100 dark:hover:bg-white/5 transition-all duration-300 group/user shadow-sm hover:shadow-md border border-transparent hover:border-neutral-200 dark:hover:border-white/5"
                aria-label="User menu"
            >
                <div className="w-7 h-7 rounded-xl bg-primary flex items-center justify-center text-[10px] font-black text-white flex-shrink-0 shadow-lg shadow-primary/20 transition-transform group-hover/user:scale-110">
                    {initials}
                </div>
                <div className="hidden sm:flex flex-col items-start leading-none">
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-900 dark:text-white">
                        {profile?.full_name?.split(' ')[0] ?? 'Account'}
                    </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-300 ${open ? 'rotate-180 text-primary' : ''}`} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 top-full mt-3 w-72 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-neutral-100 dark:border-white/10 z-50 overflow-hidden"
                    >
                        {/* Profile header */}
                        <div className="px-6 py-5 bg-neutral-50 dark:bg-white/5 border-b border-neutral-100 dark:border-white/10">
                            <div className="flex items-center gap-4 mb-1">
                                <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-xs font-black text-white shadow-xl shadow-primary/20">
                                    {initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-neutral-900 dark:text-white truncate uppercase italic tracking-tight">{profile?.full_name ?? 'Player'}</p>
                                    <p className="text-[10px] font-bold text-neutral-400 truncate tracking-wide">{profile?.email ?? ''}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-2">
                            {/* Profile link */}
                            <button
                                onClick={() => { setOpen(false); router.push('/league/player/profile'); }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/10 rounded-2xl transition-all text-left group/item"
                            >
                                <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center transition-colors group-hover/item:bg-primary/20">
                                    <User className="w-4 h-4 text-neutral-500 group-hover/item:text-primary transition-colors" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-300 group-hover/item:text-primary transition-colors">Profile Settings</span>
                            </button>

                            {/* Theme */}
                            <div className="mt-2 px-4 py-3 bg-neutral-50/50 dark:bg-white/5 rounded-3xl border border-neutral-100 dark:border-white/5">
                                <p className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-3 px-1">Appearance</p>
                                <div className="flex gap-2">
                                    {themeOptions.map(({ value, icon: Icon, label }) => (
                                        <button
                                            key={value}
                                            onClick={() => setTheme(value)}
                                            title={label}
                                            className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                                theme === value
                                                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xl scale-105 z-10'
                                                    : 'text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/10'
                                            }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span>{label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Language */}
                            <div className="mt-2 px-4 py-3">
                                <p className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-3 px-1 flex items-center gap-2">
                                    <Globe className="w-3 h-3" /> Select Language
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    {LOCALES.map((l) => (
                                        <button
                                            key={l.value}
                                            onClick={() => setLocale(l.value)}
                                            className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                locale === l.value
                                                    ? 'bg-primary/20 text-primary border border-primary/20'
                                                    : 'text-neutral-500 hover:bg-neutral-50 dark:hover:bg-white/5 border border-transparent'
                                            }`}
                                        >
                                            <span className="text-sm grayscale-[0.5]">{l.flag}</span>
                                            <span>{l.value}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sign out */}
                        <div className="p-2 border-t border-neutral-100 dark:border-white/10">
                            <button
                                onClick={() => { setOpen(false); signOut(); }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all text-left group/out"
                            >
                                <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-900/10 flex items-center justify-center transition-colors group-hover/out:bg-red-500 shadow-sm group-hover/out:shadow-red-500/50">
                                    <LogOut className="w-4 h-4 text-red-400 group-hover/out:text-white transition-colors" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-300 group-hover/out:text-red-600 dark:group-hover/out:text-red-400 transition-colors">Sign out</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
