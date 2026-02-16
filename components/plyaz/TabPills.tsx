'use client';

import React, { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Tab {
    label: string;
    value: string;
}

interface TabPillsProps {
    tabs: Tab[];
    activeTab: string;
    onChange: (value: string) => void;
    className?: string;
}

export const TabPills: React.FC<TabPillsProps> = ({
    tabs,
    activeTab,
    onChange,
    className,
}) => {
    const tabListRef = useRef<HTMLDivElement>(null);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            const currentIndex = tabs.findIndex((t) => t.value === activeTab);
            let nextIndex = currentIndex;

            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                nextIndex = (currentIndex + 1) % tabs.length;
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
            } else if (e.key === 'Home') {
                e.preventDefault();
                nextIndex = 0;
            } else if (e.key === 'End') {
                e.preventDefault();
                nextIndex = tabs.length - 1;
            } else {
                return;
            }

            onChange(tabs[nextIndex].value);
            // Focus the new tab button
            const tabList = tabListRef.current;
            if (tabList) {
                const buttons = tabList.querySelectorAll<HTMLButtonElement>('[role="tab"]');
                buttons[nextIndex]?.focus();
            }
        },
        [tabs, activeTab, onChange]
    );

    return (
        <div
            ref={tabListRef}
            role="tablist"
            aria-label="Filter tabs"
            className={cn('flex gap-2 overflow-x-auto pb-2 scrollbar-none', className)}
            onKeyDown={handleKeyDown}
        >
            {tabs.map((tab) => {
                const isActive = activeTab === tab.value;
                return (
                    <button
                        key={tab.value}
                        role="tab"
                        aria-selected={isActive}
                        tabIndex={isActive ? 0 : -1}
                        onClick={() => onChange(tab.value)}
                        className={cn(
                            'relative px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors uppercase tracking-wider',
                            isActive
                                ? 'text-white'
                                : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-200'
                        )}
                    >
                        {isActive && (
                            <motion.span
                                layoutId="tab-pill"
                                className="absolute inset-0 bg-gray-900 rounded-full"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                            />
                        )}
                        <span className="relative z-10">{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default TabPills;
