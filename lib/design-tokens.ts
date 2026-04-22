/* PLYAZ League Manager - Design Tokens
 * Centralized design system configuration
 * Aligned with PLYAZ "Kinetic Order" brand identity.
 */

export const designTokens = {
    // Colors (matching docs/design-spec.md and data/config/colors.js)
    colors: {
        brand: {
            obsidian: '#000000',
            charcoal: '#262626',
            orange: '#FF4D00',
            gradient: 'linear-gradient(135deg, #FFA132 0%, #FF4D00 100%)',
        },
        text: {
            primary: '#000000',
            secondary: '#262626',
            muted: '#737373',
            white: '#FFFFFF',
        },
        background: {
            primary: '#FFFFFF',
            secondary: '#F5F5F5',
            tertiary: '#E5E5E5',
            surface: {
                main: '#FFFFFF',
                elevated: '#F5F5F5',
                glass: 'rgba(255, 255, 255, 0.7)',
                dark: '#000000',
                darkElevated: '#262626',
            },
        },
        status: {
            live: '#FF4D00',
            liveGlow: 'rgba(255, 77, 0, 0.2)',
            upcoming: '#FFA132',
            completed: '#262626',
            cancelled: '#A3A3A3',
        },
        semantic: {
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
            info: '#3B82F6',
        },
    },

    // Typography
    typography: {
        fontFamily: {
            primary: "'General Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            accent: "'Playfair Display', serif",
        },
        fontSize: {
            hero: '64px',
            h1: '48px',
            h2: '32px',
            h3: '24px',
            h4: '18px',
            body: '16px',
            small: '14px',
            tiny: '10px',
        },
        fontWeight: {
            regular: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
            black: 900,
        },
    },

    // Spacing (8px system)
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
    },

    // Border Radius (Brand requires full round or sharp)
    borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '24px',
        xl: '32px',
        full: '9999px',
    },

    // Shadows
    shadows: {
        xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
        brand: '0 12px 24px rgba(255, 77, 0, 0.15)',
    },

    // Transitions
    transitions: {
        fast: '150ms cubic-bezier(0.19, 1, 0.22, 1)',
        normal: '300ms cubic-bezier(0.19, 1, 0.22, 1)',
        slow: '800ms cubic-bezier(0.19, 1, 0.22, 1)',
    },
};

export default designTokens;
