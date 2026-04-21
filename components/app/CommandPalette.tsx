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

export const CommandPalette = () => {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    // Toggle the menu when ⌘K is pressed
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
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
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm"
                        onClick={() => setOpen(false)}
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden relative z-10"
                    >
                        <Command className="flex flex-col h-full">
                            <div className="flex items-center px-4 border-b border-neutral-100 dark:border-neutral-800">
                                <Search className="w-4 h-4 text-neutral-400 mr-3" />
                                <Command.Input
                                    placeholder="Search commands (⌘K)..."
                                    className="w-full h-14 bg-transparent outline-none text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
                                />
                            </div>

                            <Command.List className="max-h-[300px] overflow-y-auto p-2">
                                <Command.Empty className="py-6 text-center text-sm text-neutral-400">
                                    No results found.
                                </Command.Empty>

                                <Command.Group heading="Navigation" className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 px-3 py-2">
                                    <Item onSelect={() => runCommand(() => router.push('/league'))}>
                                        <LayoutDashboard className="w-4 h-4" />
                                        <span>Dashboard</span>
                                    </Item>
                                    <Item onSelect={() => runCommand(() => router.push('/league/competitions'))}>
                                        <Trophy className="w-4 h-4" />
                                        <span>Competitions</span>
                                    </Item>
                                    <Item onSelect={() => runCommand(() => router.push('/league/teams'))}>
                                        <Users className="w-4 h-4" />
                                        <span>Teams</span>
                                    </Item>
                                    <Item onSelect={() => runCommand(() => router.push('/league/matches'))}>
                                        <Calendar className="w-4 h-4" />
                                        <span>Matches</span>
                                    </Item>
                                </Command.Group>

                                <Command.Group heading="Actions" className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 px-3 py-2 mt-2">
                                    <Item onSelect={() => runCommand(() => router.push('/league/matches/schedule'))}>
                                        <Plus className="w-4 h-4" />
                                        <span>Schedule New Match</span>
                                    </Item>
                                    <Item onSelect={() => runCommand(() => router.push('/league/invites'))}>
                                        <Plus className="w-4 h-4" />
                                        <span>Invite Members</span>
                                    </Item>
                                    <Item onSelect={() => runCommand(() => router.push('/settings'))}>
                                        <Settings className="w-4 h-4" />
                                        <span>Settings</span>
                                    </Item>
                                </Command.Group>
                            </Command.List>
                        </Command>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const Item = ({ children, onSelect }: { children: React.ReactNode; onSelect: () => void }) => (
    <Command.Item
        onSelect={onSelect}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-neutral-700 dark:text-neutral-300 aria-selected:bg-neutral-100 dark:aria-selected:bg-neutral-800 aria-selected:text-neutral-900 dark:aria-selected:text-white cursor-pointer transition-colors"
    >
        {children}
    </Command.Item>
);
