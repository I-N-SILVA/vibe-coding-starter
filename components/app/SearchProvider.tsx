'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
    Search,
    Trophy,
    Users,
    Calendar,
    Settings,
    Plus,
    LayoutDashboard,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchLinks } from '@/data/config/searchLinks';

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    // Toggle the menu when ⌘K or ⌘P is pressed
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if ((e.key === 'k' || e.key === 'p') && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    return (
        <>
            {children}
            <AnimatePresence>
                {open && (
                    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-neutral-950/60 backdrop-blur-md"
                            onClick={() => setOpen(false)}
                        />
                        
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden relative z-10"
                        >
                            <Command className="flex flex-col h-full">
                                <div className="flex items-center px-6 border-b border-neutral-100 dark:border-neutral-800">
                                    <Search className="w-4 h-4 text-neutral-400 mr-3" />
                                    <Command.Input
                                        placeholder="Search protocol or commands (⌘K)..."
                                        className="w-full h-16 bg-transparent outline-none text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                                    />
                                </div>

                                <Command.List className="max-h-[400px] overflow-y-auto p-3 scrollbar-hide">
                                    <Command.Empty className="py-12 text-center">
                                        <p className="text-sm text-neutral-400 font-medium">No results found for this query.</p>
                                    </Command.Empty>

                                    <Command.Group heading="Navigation" className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 px-4 py-3">
                                        <Item 
                                            icon={<LayoutDashboard className="w-4 h-4" />} 
                                            label="Dashboard Overview" 
                                            onSelect={() => runCommand(() => router.push('/league'))} 
                                        />
                                        {searchLinks.filter(l => l.section === 'General').map(link => (
                                            <Item 
                                                key={link.id} 
                                                icon={<div className="w-4 h-4 flex items-center justify-center"><div className="w-1 h-1 rounded-full bg-neutral-400" /></div>}
                                                label={link.name}
                                                onSelect={() => runCommand(() => router.push(link.href))}
                                            />
                                        ))}
                                    </Command.Group>

                                    <Command.Group heading="Competition" className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 px-4 py-3 mt-4">
                                        <Item 
                                            icon={<Trophy className="w-4 h-4 text-orange-500" />}
                                            label="Manage Competitions"
                                            onSelect={() => runCommand(() => router.push('/league/competitions'))}
                                        />
                                        <Item 
                                            icon={<Users className="w-4 h-4" />}
                                            label="Team Rosters"
                                            onSelect={() => runCommand(() => router.push('/league/teams'))}
                                        />
                                        <Item 
                                            icon={<Calendar className="w-4 h-4" />}
                                            label="Fixture Schedule"
                                            onSelect={() => runCommand(() => router.push('/league/matches'))}
                                        />
                                    </Command.Group>

                                    <Command.Group heading="Quick Actions" className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400 px-4 py-3 mt-4">
                                        <Item 
                                            icon={<Plus className="w-4 h-4" />}
                                            label="Schedule New Match"
                                            onSelect={() => runCommand(() => router.push('/league/matches/schedule'))}
                                        />
                                        <Item 
                                            icon={<Plus className="w-4 h-4" />}
                                            label="Invite New Members"
                                            onSelect={() => runCommand(() => router.push('/league/invites'))}
                                        />
                                        <Item 
                                            icon={<Settings className="w-4 h-4" />}
                                            label="System Settings"
                                            onSelect={() => runCommand(() => router.push('/settings'))}
                                        />
                                    </Command.Group>
                                </Command.List>

                                <div className="px-6 py-3 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-1.5">
                                            <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-[10px] font-bold text-neutral-500">↑↓</kbd>
                                            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Navigate</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-[10px] font-bold text-neutral-500">↵</kbd>
                                            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Select</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-neutral-300 dark:text-neutral-700 font-black tracking-widest uppercase italic">PLYAZ PROTOCOL</span>
                                </div>
                            </Command>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

const Item = ({ icon, label, onSelect }: { icon: React.ReactNode; label: string; onSelect: () => void }) => (
    <Command.Item
        onSelect={onSelect}
        className="flex items-center gap-4 px-4 py-3 rounded-2xl text-sm text-neutral-600 dark:text-neutral-400 aria-selected:bg-neutral-100 dark:aria-selected:bg-neutral-800 aria-selected:text-neutral-900 dark:aria-selected:text-white cursor-pointer transition-all duration-200 group"
    >
        <div className="flex-shrink-0 transition-transform group-aria-selected:scale-110">
            {icon}
        </div>
        <div className="flex-1 font-medium tracking-tight">
            {label}
        </div>
        <div className="opacity-0 group-aria-selected:opacity-100 transition-opacity">
            <kbd className="text-[10px] font-bold text-neutral-400">ENTER</kbd>
        </div>
    </Command.Item>
);

export default SearchProvider;
