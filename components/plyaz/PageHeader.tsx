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
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={cn(
                'mb-8',
                rightAction && 'flex flex-col md:flex-row justify-between items-start md:items-end gap-4',
                className
            )}
        >
            <div>
                <h1 className="text-[10px] font-medium tracking-[0.25em] uppercase text-gray-400 mb-2">
                    {label}
                </h1>
                <p className="text-2xl font-semibold text-gray-900 tracking-tight">
                    {title}
                </p>
                {description && (
                    <p className="text-xs text-gray-400 mt-1 max-w-md">
                        {description}
                    </p>
                )}
            </div>
            {rightAction && <div className="flex-shrink-0">{rightAction}</div>}
        </motion.div>
    );
};

export default PageHeader;
