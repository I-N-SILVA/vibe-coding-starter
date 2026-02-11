/* PLYAZ League Manager - Design Tokens
 * Centralized design system configuration
 */

export const designTokens = {
    // Colors (matching plyaz.net and data/config/colors.js)
    colors: {
        brand: {
            orange: '#FF5C1A',      // PLYAZ Iconic Orange
            orangeLight: '#FF7A3D',
            orangeDark: '#E64A00',
        },
        text: {
            primary: '#000000',     // Pure Black
            secondary: '#262626',   // Off-Black
            muted: '#737373',       // neutral-500
            white: '#FFFFFF',
        },
        background: {
            primary: '#FFFFFF',
            secondary: '#F9FAFB',
            tertiary: '#F3F4F6',
            surface: {
                main: '#FFFFFF',
                elevated: '#F9FAFB',
                glass: 'rgba(255, 255, 255, 0.7)',
            },
        },
        status: {
            live: '#FF5C1A',      // Use accent for live
            liveGlow: 'rgba(255, 92, 26, 0.2)',
            upcoming: '#737373',
            completed: '#10B981',
            cancelled: '#EF4444',
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
            primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            accent: "'Merriweather', Georgia, serif", // For italic accents like plyaz.net
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
        brand: '0 4px 12px rgba(249, 115, 22, 0.25)',
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
