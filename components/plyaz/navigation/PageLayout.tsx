'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
    children: React.ReactNode;
    title?: string;
    showBackButton?: boolean;
    onBackClick?: () => void;
    rightAction?: React.ReactNode;
    fullWidth?: boolean;
    className?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
    children,
    fullWidth = false,
    className,
}) => {
    return (
        <motion.main
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className={cn(
                'pb-20 md:pb-8',
                fullWidth ? 'px-0' : 'px-4 md:px-8 py-6 md:py-8 max-w-5xl',
                className
            )}
        >
            {children}
        </motion.main>
    );
};

export default PageLayout;
