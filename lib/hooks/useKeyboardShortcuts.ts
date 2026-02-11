'use client';

import { useEffect } from 'react';

/**
 * useKeyboardShortcuts Hook
 * Adds custom shortcuts to the app
 */

export const useKeyboardShortcuts = () => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only trigger if not in an input/textarea
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                (e.target as HTMLElement).isContentEditable
            ) {
                return;
            }

            // 'K' shortcut for search (triggering Cmd+K behavior)
            if (e.key === 'k' || e.key === 'K') {
                e.preventDefault();

                // Dispatch a Cmd+K (Mac) or Ctrl+K (Windows) event
                const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
                const event = new KeyboardEvent('keydown', {
                    key: 'k',
                    code: 'KeyK',
                    metaKey: isMac,
                    ctrlKey: !isMac,
                    bubbles: true,
                    cancelable: true
                });
                document.dispatchEvent(event);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
};
