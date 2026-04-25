'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { NavItem } from '@/components/plyaz/navigation/types';

interface CommandPaletteProps {
    open: boolean;
    onClose: () => void;
    items: NavItem[];
}

export function CommandPalette({ open, onClose, items }: CommandPaletteProps) {
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const filtered = query.trim() === ''
        ? items
        : items.filter((item) =>
            item.label.toLowerCase().includes(query.toLowerCase()) ||
            item.href.toLowerCase().includes(query.toLowerCase())
        );

    const navigate = useCallback((href: string) => {
        router.push(href);
        onClose();
        setQuery('');
    }, [router, onClose]);

    // Focus input when opened
    useEffect(() => {
        if (open) {
            setQuery('');
            setActiveIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    // Reset active index when filter changes
    useEffect(() => {
        setActiveIndex(0);
    }, [query]);

    // Keyboard navigation
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { onClose(); setQuery(''); }
            if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, filtered.length - 1)); }
            if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)); }
            if (e.key === 'Enter' && filtered[activeIndex]) { navigate(filtered[activeIndex].href); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, filtered, activeIndex, navigate, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
                        onClick={() => { onClose(); setQuery(''); }}
                    />

                    {/* Palette */}
                    <motion.div
                        initial={{ opacity: 0, y: -16, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -16, scale: 0.97 }}
                        transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                        className="fixed top-[10vh] left-1/2 -translate-x-1/2 z-[101] w-full max-w-md px-4"
                    >
                        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
                            {/* Search input */}
                            <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
                                <svg className="w-4 h-4 text-neutral-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    ref={inputRef}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search or navigate..."
                                    className="flex-1 text-sm bg-transparent outline-none text-neutral-900 dark:text-white placeholder-neutral-400"
                                />
                                <kbd className="hidden sm:flex text-[9px] font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded">ESC</kbd>
                            </div>

                            {/* Results */}
                            <div className="max-h-72 overflow-y-auto py-2">
                                {filtered.length === 0 ? (
                                    <p className="text-center text-xs text-neutral-400 py-6">No results for &ldquo;{query}&rdquo;</p>
                                ) : (
                                    filtered.map((item, i) => (
                                        <button
                                            key={item.href}
                                            onClick={() => navigate(item.href)}
                                            onMouseEnter={() => setActiveIndex(i)}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left ${
                                                i === activeIndex
                                                    ? 'bg-neutral-900 dark:bg-white/10 text-white'
                                                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                                            }`}
                                        >
                                            <span className={`w-4 h-4 flex-shrink-0 ${i === activeIndex ? 'text-orange-400' : 'text-neutral-400'}`}>
                                                {item.icon}
                                            </span>
                                            <span className="text-sm font-medium">{item.label}</span>
                                            <span className={`ml-auto text-[10px] font-mono ${i === activeIndex ? 'text-neutral-400' : 'text-neutral-300 dark:text-neutral-600'}`}>
                                                {item.href}
                                            </span>
                                        </button>
                                    ))
                                )}
                            </div>

                            {/* Footer hint */}
                            <div className="px-4 py-2 border-t border-neutral-50 dark:border-neutral-800/50 flex items-center gap-4 text-[10px] text-neutral-300 dark:text-neutral-600">
                                <span><kbd className="font-mono">↑↓</kbd> navigate</span>
                                <span><kbd className="font-mono">↵</kbd> go</span>
                                <span><kbd className="font-mono">esc</kbd> close</span>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default CommandPalette;
