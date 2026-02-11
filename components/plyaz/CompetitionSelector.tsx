'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface Competition {
    id: string;
    name: string;
}

interface CompetitionSelectorProps {
    competitions: Competition[];
    selected: string;
    onChange: (id: string) => void;
    className?: string;
}

export const CompetitionSelector: React.FC<CompetitionSelectorProps> = ({
    competitions,
    selected,
    onChange,
    className,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedComp = competitions.find((c) => c.id === selected);

    return (
        <div className={cn('relative inline-block', className)}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-900 hover:border-gray-300 transition-colors"
            >
                <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mr-1">
                    League:
                </span>
                <span className="tracking-tight">{selectedComp?.name || 'All Competitions'}</span>
                <svg
                    className={cn('w-4 h-4 text-gray-400 transition-transform', isOpen && 'rotate-180')}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg border border-gray-200 shadow-lg z-50 py-1 overflow-hidden">
                        <button
                            onClick={() => { onChange(''); setIsOpen(false); }}
                            className={cn(
                                'w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors',
                                !selected && 'bg-gray-50 font-medium'
                            )}
                        >
                            All Competitions
                        </button>
                        {competitions.map((comp) => (
                            <button
                                key={comp.id}
                                onClick={() => { onChange(comp.id); setIsOpen(false); }}
                                className={cn(
                                    'w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors',
                                    selected === comp.id && 'bg-gray-50 font-medium'
                                )}
                            >
                                {comp.name}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default CompetitionSelector;
