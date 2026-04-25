'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
    label: string;
    title: string;
    description?: string;
    rightAction?: React.ReactNode;
    className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    label,
    title,
    description,
    rightAction,
    className,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
            className={cn(
                'mb-10 relative',
                rightAction && 'flex flex-col md:flex-row justify-between items-start md:items-end gap-6',
                className
            )}
        >
            <div className="relative">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-4 w-1 bg-primary rounded-full shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                    <h1 className="text-[11px] font-black tracking-[0.4em] uppercase text-neutral-400 dark:text-neutral-500">
                        {label}
                    </h1>
                </div>
                
                <h2 className="text-4xl font-black text-neutral-900 dark:text-white tracking-tight uppercase italic leading-none">
                    {title}
                </h2>
                
                {description && (
                    <p className="text-xs font-medium text-neutral-400 dark:text-neutral-500 mt-3 max-w-lg leading-relaxed">
                        {description}
                    </p>
                )}
            </div>

            {rightAction && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex-shrink-0"
                >
                    {rightAction}
                </motion.div>
            )}
        </motion.div>
    );
};

export default PageHeader;
