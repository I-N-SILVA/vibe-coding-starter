/* PLYAZ League Manager - Color Configuration
 * Aligned with PLYAZ brand identity (Purple to Orange).
 */
const colors = {
  primary: {
    lighter: '#A78BFA', // purple-400
    light: '#8B5CF6',   // purple-500
    main: '#7C3AED',    // purple-600 (Brand Purple)
    dark: '#6D28D9',    // purple-700
    darker: '#5B21B6',  // purple-800
  },
  secondary: {
    lighter: '#F8FAFC', // slate-50
    light: '#F1F5F9',   // slate-100
    main: '#64748B',    // slate-500
    dark: '#334155',    // slate-700
    darker: '#0F172A',  // slate-900 (Brand Dark)
  },
  accent: {
    lighter: '#FB923C', // orange-400
    light: '#FB7185',   // orange-500
    main: '#F97316',    // orange-600 (Brand Orange)
    dark: '#EA580C',    // orange-700
    darker: '#C2410C',  // orange-800
  },
  surface: {
    main: '#FFFFFF',
    elevated: '#F8FAFC',
    glass: 'rgba(255, 255, 255, 0.7)',
    dark: '#0F172A',
    darkElevated: '#1E293B',
  },
  status: {
    live: '#EF4444',    // red-500 (per spec)
    upcoming: '#3B82F6', // blue-500
    completed: '#64748B', // slate-500
    cancelled: '#94A3B8', // slate-400
  },
};

module.exports = { colors };
