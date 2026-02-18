'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LocalStore } from '@/lib/mock/store';
import {
    Shield,
    PlayCircle,
    User,
    Eye,
} from 'lucide-react';

/**
 * RolePreview — PLYAZ Landing Page Section
 * Netflix-inspired role selector. Click an avatar to enter the app as that role.
 */

type RoleId = 'organizer' | 'referee' | 'player' | 'fan';

interface RoleProfile {
    id: RoleId;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    route: string;
    gradient: string;
    hoverBorder: string;
}

const roles: RoleProfile[] = [
    {
        id: 'organizer',
        label: 'League Manager',
        sublabel: 'Full Control',
        icon: <Shield className="w-8 h-8 md:w-10 md:h-10" />,
        route: '/league',
        gradient: 'from-orange-500 to-amber-600',
        hoverBorder: 'hover:border-orange-500',
    },
    {
        id: 'referee',
        label: 'Referee',
        sublabel: 'Live Scoring',
        icon: <PlayCircle className="w-8 h-8 md:w-10 md:h-10" />,
        route: '/league/matches/schedule',
        gradient: 'from-blue-500 to-indigo-600',
        hoverBorder: 'hover:border-blue-500',
    },
    {
        id: 'player',
        label: 'Player',
        sublabel: 'My Stats',
        icon: <User className="w-8 h-8 md:w-10 md:h-10" />,
        route: '/league/statistics',
        gradient: 'from-green-500 to-emerald-600',
        hoverBorder: 'hover:border-green-500',
    },
    {
        id: 'fan',
        label: 'Fan',
        sublabel: 'Public View',
        icon: <Eye className="w-8 h-8 md:w-10 md:h-10" />,
        route: '/league/public',
        gradient: 'from-purple-500 to-violet-600',
        hoverBorder: 'hover:border-purple-500',
    },
];

function seedWorldData() {
    // Only seed if data doesn't exist yet
    if (LocalStore.get('organizations').length > 0) return;

    const org = LocalStore.addItem('organizations', {
        name: 'PLYAZ Youth League',
        slug: 'plyaz-youth',
        description: 'The premier championship for professional youth teams.',
    });

    const catU16 = LocalStore.addItem('categories', {
        name: 'U-16 Elite',
        organizationId: org.id,
        minAge: 14,
        maxAge: 16,
    });

    LocalStore.addItem('competitions', {
        name: 'Premier League 2026',
        organizationId: org.id,
        categoryId: catU16.id,
        type: 'league',
        status: 'active',
        startDate: '2026-02-01',
    });

    LocalStore.addItem('competitions', {
        name: 'Champions Cup',
        organizationId: org.id,
        categoryId: catU16.id,
        type: 'knockout',
        status: 'active',
        startDate: '2026-03-15',
    });

    const teams = ['Phoenix FC', 'City Rangers', 'Eagles', 'Rovers', 'United', 'Strikers'].map(
        (name) =>
            LocalStore.addItem('teams', {
                name,
                organizationId: org.id,
                shortName: name.substring(0, 3).toUpperCase(),
            })
    );

    ['Marcus Rivera', 'James Okafor', 'Leo Tanaka', 'Daniel Petrov', 'Ryan Chen'].forEach(
        (name, i) => {
            LocalStore.addItem('players', {
                firstName: name.split(' ')[0],
                lastName: name.split(' ')[1],
                displayName: name,
                teamId: teams[i % teams.length].id,
                position: i === 0 ? 'goalkeeper' : i < 3 ? 'midfielder' : 'forward',
                number: 1 + i,
            });
        }
    );
}

export const RolePreview: React.FC = () => {
    const router = useRouter();

    const handleRoleSelect = useCallback(
        (role: RoleProfile) => {
            // 1. Enable simulation mode
            localStorage.setItem('plyaz_simulation_enabled', 'true');

            // 2. Set the persona
            localStorage.setItem('plyaz_debug_persona', role.id);

            // 3. Seed data if needed
            seedWorldData();

            // 4. Navigate
            router.push(role.route);
        },
        [router]
    );

    return (
        <section className="py-32 md:py-40 bg-black text-white relative overflow-hidden">
            {/* Dot grid background */}
            <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                    backgroundSize: '24px 24px',
                }}
            />

            <div className="max-w-5xl mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="text-center mb-20">
                    <h2 className="text-[10px] font-black tracking-[0.3em] text-white/30 uppercase mb-6">
                        Interactive Preview
                    </h2>
                    <h3 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white uppercase leading-[0.85]">
                        Experience <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                            every role.
                        </span>
                    </h3>
                    <p className="text-sm md:text-base text-white/40 mt-6 max-w-md mx-auto font-medium">
                        Click a profile to explore the platform from their perspective. No sign-up required.
                    </p>
                </div>

                {/* Role Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                    {roles.map((role, index) => (
                        <motion.button
                            key={role.id}
                            onClick={() => handleRoleSelect(role)}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                            className={cn(
                                'group relative flex flex-col items-center text-center focus:outline-none',
                            )}
                        >
                            {/* Avatar Circle */}
                            <div
                                className={cn(
                                    'relative w-24 h-24 md:w-32 md:h-32 rounded-full mb-5',
                                    'border-2 border-white/10 transition-all duration-500',
                                    'group-hover:border-transparent group-hover:scale-105',
                                    role.hoverBorder,
                                )}
                            >
                                {/* Gradient Glow on Hover */}
                                <div
                                    className={cn(
                                        'absolute -inset-1 rounded-full bg-gradient-to-br opacity-0 blur-xl transition-opacity duration-500',
                                        'group-hover:opacity-30',
                                        role.gradient,
                                    )}
                                />
                                {/* Icon Container */}
                                <div
                                    className={cn(
                                        'relative w-full h-full rounded-full flex items-center justify-center',
                                        'bg-white/5 text-white/50 transition-all duration-500',
                                        'group-hover:bg-gradient-to-br group-hover:text-white',
                                        `group-hover:${role.gradient}`,
                                    )}
                                >
                                    {role.icon}
                                </div>
                            </div>

                            {/* Text */}
                            <h4 className="text-sm md:text-base font-black tracking-tight text-white/70 group-hover:text-white transition-colors uppercase">
                                {role.label}
                            </h4>
                            <p className="text-[10px] font-bold tracking-widest text-white/20 group-hover:text-white/40 transition-colors uppercase mt-1">
                                {role.sublabel}
                            </p>

                            {/* "Enter" indicator on hover */}
                            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                <span className="text-[9px] font-black tracking-[0.2em] text-orange-500 uppercase px-3 py-1.5 border border-orange-500/30 rounded-full">
                                    Enter →
                                </span>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RolePreview;
