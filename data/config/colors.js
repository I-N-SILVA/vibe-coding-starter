/* PLYAZ League Manager - Color Configuration
 * Aligned with PLYAZ "Kinetic Order" brand identity.
 */
const colors = {
  primary: {
    lighter: '#FF7A32', // orange-400
    light: '#FF6419',   // orange-500
    main: '#FF4D00',    // PLYAZ ORANGE
    dark: '#E64500',    // dark orange
    darker: '#CC3D00',  // darker orange
  },
  secondary: {
    lighter: '#F5F5F5', // light gray
    light: '#E5E5E5',   // gray-200
    main: '#262626',    // CHARCOAL
    dark: '#171717',    // darker charcoal
    darker: '#000000',  // OBSIDIAN
  },
  accent: {
    lighter: '#FFA132', // Start of primary gradient
    light: '#FF7A32',
    main: '#FF4D00',    // End of primary gradient
    dark: '#E64500',
    darker: '#CC3D00',
    gradient: 'linear-gradient(135deg, #FFA132 0%, #FF4D00 100%)',
  },
  surface: {
    main: '#FFFFFF',    // CANVAS WHITE
    elevated: '#F5F5F5',
    glass: 'rgba(255, 255, 255, 0.7)',
    dark: '#000000',    // OBSIDIAN
    darkElevated: '#262626', // CHARCOAL
  },
  status: {
    live: '#FF4D00',    // use brand orange for live
    upcoming: '#FFA132', 
    completed: '#262626',
    cancelled: '#A3A3A3',
  },
};

module.exports = { colors };
