'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { NavItem } from './types';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

/**
 * PageLayout Component - PLYAZ Design System
 * Complete page layout with responsive navigation
 */

interface PageLayoutProps {
    children: React.ReactNode;
    navItems: NavItem[];
    title?: string;
    showBackButton?: boolean;
    onBackClick?: () => void;
    rightAction?: React.ReactNode;
    fullWidth?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
    children,
    navItems,
    title,
    showBackButton,
    onBackClick,
    rightAction,
    fullWidth = false,
}) => {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-white">
            <Navbar
                title={title}
                showBackButton={showBackButton}
                onBackClick={onBackClick || (() => router.back())}
                rightAction={rightAction}
            />

            <Sidebar items={navItems} />

            <motion.main
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className={cn(
                    'md:ml-64 pb-20 md:pb-8',
                    fullWidth ? 'px-0' : 'px-4 md:px-8 py-6 md:py-8 max-w-5xl'
                )}
            >
                {children}
            </motion.main>

            <MobileNav items={navItems} />
        </div>
    );
};

export default PageLayout;
