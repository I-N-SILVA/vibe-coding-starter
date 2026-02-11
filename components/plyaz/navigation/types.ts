import React from 'react';

/**
 * Navigation Types - PLYAZ Design System
 * Shared types for navigation components
 */

export interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    roles?: string[]; // For role-based visibility
}
