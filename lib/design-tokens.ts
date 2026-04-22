/* PLYAZ League Manager - Design Tokens
 * Centralized design system configuration
 * Aligned with PLYAZ brand identity (Purple to Orange)
 */

export const designTokens = {
    // Colors (matching docs/design-spec.md and data/config/colors.js)
    colors: {
        brand: {
            purple: '#7C3AED',       // Brand Purple
            orange: '#F97316',       // Brand Orange
            gradient: 'linear-gradient(to right, #7C3AED, #F97316)',
        },
        text: {
            primary: '#0F172A',      // slate-900
            secondary: '#334155',    // slate-700
            muted: '#64748B',        // slate-500
            white: '#FFFFFF',
        },
        background: {
            primary: '#F8FAFC',      // slate-50
            secondary: '#F1F5F9',    // slate-100
            tertiary: '#E2E8F0',     // slate-200
            surface: {
                main: '#FFFFFF',
                elevated: '#F8FAFC',
                glass: 'rgba(255, 255, 255, 0.7)',
                dark: '#0F172A',
                darkElevated: '#1E293B',
            },
        },
        status: {
            live: '#EF4444',         // red-500
            liveGlow: 'rgba(239, 68, 68, 0.2)',
            upcoming: '#3B82F6',     // blue-500
            completed: '#64748B',    // slate-500
            cancelled: '#94A3B8',    // slate-400
        },
        semantic: {
            success: '#10B981',      // green-500
            warning: '#F59E0B',      // amber-500
            error: '#EF4444',        // red-500
            info: '#3B82F6',         // blue-500
        },
    },

    // Typography
    typography: {
        fontFamily: {
            primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            accent: "'Montserrat', sans-serif",
        },
        fontSize: {
            hero: '48px',
            h1: '36px',
            h2: '30px',
            h3: '24px',
            h4: '20px',
            body: '16px',
            small: '14px',
            tiny: '12px',
        },
        fontWeight: {
            regular: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
            extrabold: 800,
        },
    },

    // Spacing
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
    },

    // Border Radius
    borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        full: '9999px',
    },

    // Shadows
    shadows: {
        xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
        brand: '0 4px 12px rgba(124, 58, 237, 0.25)',
    },

    // Transitions
    transitions: {
        fast: '150ms ease',
        normal: '250ms ease',
        slow: '400ms ease',
    },

    // Component-specific tokens
    components: {
        button: {
            height: '44px',
            heightLg: '60px', // For referee controls
            borderRadius: '12px',
        },
        card: {
            borderRadius: '16px',
            padding: '24px',
        },
        input: {
            height: '44px',
            borderRadius: '12px',
        },
        badge: {
            borderRadius: '9999px',
            padding: '4px 12px',
        },
        navbar: {
            height: '64px',
        },
        bottomNav: {
            height: '64px',
        },
    },
};

export default designTokens;
