'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

/**
 * ThemeToggle Component - PLYAZ Design System
 * Switch between light and dark modes
 */

export const ThemeToggle = () => {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="p-2 w-9 h-9" />;
    }

    const isDark = theme === 'dark';

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
            aria-label="Toggle theme"
        >
            {isDark ? (
                <Sun className="w-5 h-5 text-neutral-400 group-hover:text-orange-500 transition-colors" />
            ) : (
                <Moon className="w-5 h-5 text-neutral-500 group-hover:text-orange-500 transition-colors" />
            )}
        </button>
    );
};

export default ThemeToggle;
