'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LocalStore } from '@/lib/mock/store';
import {
    Button,
    Card,
    CardContent,
    Badge,
    PageHeader,
    Modal
} from '@/components/plyaz';
import {
    Shield,
    Users,
    Trophy,
    Calendar,
    Settings,
    User,
    PlayCircle,
    Database,
    RefreshCw,
    ExternalLink,
    ChevronRight,
    Eye,
    CheckCircle2,
    AlertCircle,
    Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types for our internal debug state
type Persona = 'organizer' | 'referee' | 'player' | 'fan';

export default function DebugFlowsPage() {
    const router = useRouter();
    const [stats, setStats] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [activePersona, setActivePersona] = useState<Persona>('organizer');
    const [isSimulationEnabled, setIsSimulationEnabled] = useState(false);

    useEffect(() => {
        refreshStats();
        // Check if simulation is enabled
        const simEnabled = localStorage.getItem('plyaz_simulation_enabled') === 'true';
        setIsSimulationEnabled(simEnabled);

        // Check if persona is already in localStorage
        const savedPersona = localStorage.getItem('plyaz_debug_persona') as Persona;
        if (savedPersona) setActivePersona(savedPersona);
    }, []);

    const toggleSimulation = () => {
        const newState = !isSimulationEnabled;
        setIsSimulationEnabled(newState);
        localStorage.setItem('plyaz_simulation_enabled', String(newState));
        // Force reload to apply interceptors
        if (confirm('Refreshing page to apply Simulation Mode changes...')) {
            window.location.reload();
        }
    };

    const autoPilot = async () => {
        setIsLoading(true);
        localStorage.setItem('plyaz_simulation_enabled', 'true');
        seedMockData();
        selectPersona('organizer');
        refreshStats();
        setIsLoading(false);
        router.push('/league');
    };

    const refreshStats = () => {
        const keys = ['organizations', 'competitions', 'teams', 'players', 'matches', 'categories'];
        const currentStats: Record<string, number> = {};
        keys.forEach(key => {
            currentStats[key] = LocalStore.get(key).length;
        });
        setStats(currentStats);
    };

    const seedMockData = () => {
        setIsLoading(true);

        // 1. Create Organization
        const org = LocalStore.addItem('organizations', {
            name: 'PLYAZ Youth League',
            slug: 'plyaz-youth',
            description: 'The premier championship for professional youth teams.'
        });

        // 2. Create Categories
        const catU16 = LocalStore.addItem('categories', {
            name: 'U-16 Elite',
            organizationId: org.id,
            minAge: 14,
            maxAge: 16
        });

        // 3. Create Round Robin Competition
        const leagueComp = LocalStore.addItem('competitions', {
            name: 'Premier League 2026',
            organizationId: org.id,
            categoryId: catU16.id,
            type: 'league',
            status: 'active',
            startDate: '2026-02-01'
        });

        // 4. Create Knockout Competition
        const cupComp = LocalStore.addItem('competitions', {
            name: 'Champions Cup',
            organizationId: org.id,
            categoryId: catU16.id,
            type: 'knockout',
            status: 'active',
            startDate: '2026-03-15'
        });

        // 5. Create Teams
        const teams = ['Phoenix FC', 'City Rangers', 'Eagles', 'Rovers', 'United', 'Strikers'].map(name =>
            LocalStore.addItem('teams', {
                name,
                organizationId: org.id,
                shortName: name.substring(0, 3).toUpperCase()
            })
        );

        // 6. Create Players for first team
        ['John Doe', 'Mike Smith', 'Alex Wong'].forEach((name, i) => {
            LocalStore.addItem('players', {
                firstName: name.split(' ')[0],
                lastName: name.split(' ')[1],
                displayName: name,
                teamId: teams[0].id,
                position: i === 0 ? 'goalkeeper' : 'forward',
                number: 1 + i
            });
        });

        refreshStats();
        setIsLoading(false);
    };

    const clearData = () => {
        if (confirm('Are you sure you want to clear all mock data?')) {
            const keys = ['organizations', 'competitions', 'teams', 'players', 'matches', 'categories', 'championship_config', 'groups', 'group_teams', 'competition_registrations'];
            keys.forEach(key => localStorage.removeItem(`plyaz_${key}`));
            refreshStats();
        }
    };

    const personas = [
        {
            id: 'organizer',
            name: 'The Manager',
            icon: <Shield className="w-5 h-5" />,
            description: 'Full control over the league, teams, and rules.',
            color: 'bg-orange-500',
            flows: [
                { name: 'Admin Dashboard', path: '/league', desc: 'Overview of all activities' },
                { name: 'Competition Settings', path: '/league/competitions', desc: 'Manage formats and rules' },
                { name: 'Team Management', path: '/league/teams', desc: 'Configure rosters' },
                { name: 'Draw & Seeding', path: '/league/competitions/draw', desc: 'Generate brackets & groups' }
            ]
        },
        {
            id: 'referee',
            name: 'The Referee',
            icon: <PlayCircle className="w-5 h-5" />,
            description: 'Live match scoring and event recording.',
            color: 'bg-blue-500',
            flows: [
                { name: 'Referee Portal', path: '/league/referee', desc: 'Match assignment list' },
                { name: 'Live Scoreboard', path: '/league/matches/live', desc: 'Real-time event entry' },
                { name: 'Match Schedule', path: '/league/matches/schedule', desc: 'Upcoming assignments' }
            ]
        },
        {
            id: 'player',
            name: 'The Player',
            icon: <User className="w-5 h-5" />,
            description: 'Registration and personal performance tracking.',
            color: 'bg-green-500',
            flows: [
                { name: 'Personal Stats', path: '/league/statistics', desc: 'Goals, assists, and cards' },
                { name: 'Registration', path: '/league/invites', desc: 'Join a competition' },
                { name: 'Team Profile', path: '/league/teams', desc: 'View squad and fixtures' }
            ]
        },
        {
            id: 'fan',
            name: 'The Fan',
            icon: <Users className="w-5 h-5" />,
            description: 'Public rankings, scores, and team updates.',
            color: 'bg-purple-500',
            flows: [
                { name: 'Public Standings', path: '/league/public/standings', desc: 'League table / Brackets' },
                { name: 'Tournament Home', path: '/league/public', desc: 'Switch between leagues' },
                { name: 'Live Scores', path: '/league/public/scoreboard', desc: 'Fan-centric live view' }
            ]
        }
    ] as const;

    const currentPersona = personas.find(p => p.id === activePersona)!;

    const selectPersona = (id: Persona) => {
        setActivePersona(id);
        localStorage.setItem('plyaz_debug_persona', id);
    };

    return (
        <div className="min-h-screen bg-surface-elevated pb-20">
            <div className="bg-white border-b border-gray-100">
                <div className="container py-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="bg-orange-50 text-orange-600 border-orange-100">Debug Mode</Badge>
                                <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                                    <Database className="w-3 h-3" />
                                    Local System Active
                                </div>
                            </div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Immersive Journey.</h1>
                            <p className="text-gray-500 mt-1 max-w-xl italic">
                                Experience PLYAZ through the eyes of every user. Seed data, switch roles, and verify the flow.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button
                                variant="secondary"
                                onClick={toggleSimulation}
                                className={cn(
                                    "border-2 transition-all",
                                    isSimulationEnabled ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200"
                                )}
                            >
                                <Zap className={cn("w-4 h-4 mr-2", isSimulationEnabled ? "fill-current" : "")} />
                                Simulation: {isSimulationEnabled ? 'ON' : 'OFF'}
                            </Button>
                            <Button variant="secondary" onClick={clearData} className="group">
                                <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                                Reset Data
                            </Button>
                            <Button onClick={autoPilot} className="bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20">
                                <Zap className="w-4 h-4 mr-2 fill-current" />
                                Run Auto-Pilot
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mt-10">
                        {Object.entries(stats).map(([key, value]) => (
                            <div key={key} className="bg-gray-50/50 p-4 border border-gray-100 rounded-xl">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{key}</div>
                                <div className="text-2xl font-black text-gray-900">{value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mt-12">
                <div className="grid lg:grid-cols-12 gap-12">
                    {/* Persona Selection */}
                    <div className="lg:col-span-4 space-y-4">
                        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Step 1: Choose Identity</h2>
                        <div className="space-y-3">
                            {personas.map(persona => (
                                <button
                                    key={persona.id}
                                    onClick={() => selectPersona(persona.id)}
                                    className={cn(
                                        "w-full text-left p-6 rounded-2xl border-2 transition-all group relative overflow-hidden",
                                        activePersona === persona.id
                                            ? "border-black bg-white shadow-xl shadow-gray-200/50"
                                            : "border-transparent bg-white hover:border-gray-200"
                                    )}
                                >
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                                                activePersona === persona.id ? "bg-black text-white" : "bg-gray-50 text-gray-400 group-hover:bg-gray-100"
                                            )}>
                                                {persona.icon}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{persona.name}</div>
                                                <div className="text-xs text-gray-500 line-clamp-1">{persona.description}</div>
                                            </div>
                                        </div>
                                        {activePersona === persona.id && (
                                            <CheckCircle2 className="w-5 h-5 text-orange-500" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* User Flow Navigation */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-12 shadow-sm min-h-[500px]">
                            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-50">
                                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white", currentPersona.color)}>
                                    {currentPersona.icon}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Active Journey: {currentPersona.name}</h3>
                                    <p className="text-gray-500 text-sm">{currentPersona.description}</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {currentPersona.flows.map((flow, i) => (
                                    <Link
                                        key={flow.path}
                                        href={flow.path}
                                        className="group"
                                    >
                                        <Card className="hover:border-orange-500/30 transition-all hover:bg-orange-50/10 p-6 h-full border-gray-50 bg-gray-50/30">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-900 font-black text-xs border border-gray-100">
                                                    {i + 1}
                                                </div>
                                                <div className="p-2 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ExternalLink className="w-3 h-3 text-orange-500" />
                                                </div>
                                            </div>
                                            <h4 className="font-black text-gray-900 mb-1 group-hover:text-orange-600 transition-colors uppercase tracking-tight">
                                                {flow.name}
                                            </h4>
                                            <p className="text-xs text-gray-400 leading-relaxed font-medium">
                                                {flow.desc}
                                            </p>
                                            <div className="mt-4 flex items-center text-[10px] font-bold text-gray-300 group-hover:text-orange-300 transition-colors">
                                                PATH: {flow.path}
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>

                            <div className="mt-12 p-6 bg-gray-900 rounded-2xl text-white flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                        <Eye className="w-5 h-5 text-orange-400" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">Testing this flow?</div>
                                        <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Recommended: Use iPhone 14 Pro Responsive View</div>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    className="bg-orange-500 hover:bg-orange-600 border-none"
                                    onClick={() => window.open(currentPersona.flows[0].path, '_blank')}
                                >
                                    Start Now
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
