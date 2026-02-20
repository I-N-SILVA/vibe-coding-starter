'use client';

import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';

/**
 * Global Keyboard Shortcuts component
 * Place this in layout to enable shortcuts app-wide
 */

export const ClientShortcuts = () => {
    useKeyboardShortcuts();
    return null;
};

export default ClientShortcuts;
