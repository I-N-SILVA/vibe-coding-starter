// PLYAZ League Manager - Component Library
// Export all components for easy importing

// Core UI
export { Button } from './Button';
export type { ButtonProps } from './Button';

// Cards
export { Card, CardHeader, CardTitle, CardContent, CardFooter } from './Card';
export type { CardProps } from './Card';

export { MatchCard } from './MatchCard';
export type { MatchCardProps, Team } from './MatchCard';

export { StatCard, TeamCard, PlayerCard, UltimatePlayerCard } from './cards';
export type { StatCardProps, TeamCardProps, PlayerCardProps, UltimatePlayerCardProps } from './cards';

// Badges
export { Badge, StatusBadge } from './Badge';
export type { BadgeProps, StatusBadgeProps, MatchStatus } from './Badge';

// Modals
export { Modal, ConfirmModal } from './Modal';
export type { ModalProps, ConfirmModalProps } from './Modal';

// Form Elements
export { Input, Select, Toggle } from './Input';
export type { InputProps, SelectProps, ToggleProps } from './Input';

// Shared Components
export { PageHeader } from './PageHeader';
export { EmptyState } from './EmptyState';
export { TabPills } from './TabPills';
export { CompetitionSelector } from './CompetitionSelector';
export { KnockoutBracket } from './KnockoutBracket';
export { SimulationBanner } from './SimulationBanner';
export {
    Skeleton,
    SkeletonStatCard,
    SkeletonMatchCard,
    SkeletonTableRow,
    SkeletonCard,
    SkeletonChartCard,
} from './Skeleton';

// Navigation (Modular)
import { Navbar, MobileNav, Sidebar, PageLayout, NavIcons, PlyazLogo } from './navigation';
import { ThemeToggle } from './ThemeToggle';
export type { NavItem } from './navigation';

export {
    Navbar,
    MobileNav,
    Sidebar,
    PageLayout,
    NavIcons,
    PlyazLogo,
    ThemeToggle,
};
