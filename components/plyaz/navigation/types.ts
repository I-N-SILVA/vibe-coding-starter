import React from 'react';

export interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    roles?: string[];
}

export interface NavGroup {
    label: string;
    items: NavItem[];
}
