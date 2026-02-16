/**
 * Shared Animation Variants - PLYAZ League Manager
 * Reusable Framer Motion variants for consistent page animations.
 */

/** Stagger container - staggers children with a small delay */
export const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

/** Fade up for admin/league pages (subtle, y: 12, fast) */
export const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

/** Fade up for marketing/public pages (bigger, y: 20, slower) */
export const fadeUpLarge = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};
