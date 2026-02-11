'use client';

import React from 'react';
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
    return (
        <div className={cn('flex gap-2 overflow-x-auto pb-2 scrollbar-none', className)}>
            {tabs.map((tab) => (
                <button
                    key={tab.value}
                    onClick={() => onChange(tab.value)}
                    className={cn(
                        'relative px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors uppercase tracking-wider',
                        activeTab === tab.value
                            ? 'text-white'
                            : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-200'
                    )}
                >
                    {activeTab === tab.value && (
                        <motion.span
                            layoutId="tab-pill"
                            className="absolute inset-0 bg-gray-900 rounded-full"
                            transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                        />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                </button>
            ))}
        </div>
    );
};

export default TabPills;
