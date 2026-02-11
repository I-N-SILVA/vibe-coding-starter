'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    Button,
    Input,
    Badge,
} from '@/components/plyaz';
import { PageLayout } from '@/components/plyaz/navigation/PageLayout';
import { adminNavItems } from '@/lib/constants/navigation';

interface Player {
    id: string;
    name: string;
    position: string;
    jersey_number: number | null;
    team_name?: string;
    status: string;
    stats?: Record<string, number>;
}

const DEMO_PLAYERS: Player[] = [
    { id: '1', name: 'Marcus Johnson', position: 'ST', jersey_number: 9, team_name: 'FC United', status: 'active', stats: { goals: 12, assists: 5 } },
    { id: '2', name: 'David Chen', position: 'GK', jersey_number: 1, team_name: 'City Rangers', status: 'active', stats: { goals: 0, assists: 0 } },
    { id: '3', name: 'James Obi', position: 'CM', jersey_number: 8, team_name: 'Phoenix FC', status: 'active', stats: { goals: 4, assists: 11 } },
    { id: '4', name: 'Ryan Williams', position: 'CB', jersey_number: 4, team_name: 'FC United', status: 'active', stats: { goals: 1, assists: 2 } },
    { id: '5', name: 'Ahmed Hassan', position: 'LW', jersey_number: 11, team_name: 'Eagles', status: 'suspended', stats: { goals: 7, assists: 8 } },
    { id: '6', name: 'Tom Clarke', position: 'RB', jersey_number: 2, team_name: 'Rovers', status: 'injured', stats: { goals: 0, assists: 4 } },
    { id: '7', name: 'Kai Patel', position: 'CAM', jersey_number: 10, team_name: 'Athletic', status: 'active', stats: { goals: 9, assists: 14 } },
    { id: '8', name: 'Leo Martinez', position: 'CDM', jersey_number: 6, team_name: 'City Rangers', status: 'active', stats: { goals: 2, assists: 6 } },
];

const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    suspended: 'bg-red-100 text-red-700',
    injured: 'bg-yellow-100 text-yellow-700',
};

export default function PlayersAdminPage() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [search, setSearch] = useState('');
    const [filterTeam, setFilterTeam] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/league/players')
            .then((r) => r.json())
            .then((data) => {
                setPlayers(Array.isArray(data) ? data : DEMO_PLAYERS);
            })
            .catch(() => setPlayers(DEMO_PLAYERS))
            .finally(() => setIsLoading(false));
    }, []);

    const teams = [...new Set(players.map((p) => p.team_name).filter(Boolean))];

    const filtered = players.filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.position.toLowerCase().includes(search.toLowerCase());
        const matchesTeam = !filterTeam || p.team_name === filterTeam;
        return matchesSearch && matchesTeam;
    });

    return (
        <PageLayout navItems={adminNavItems} title="Players">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-black tracking-tight">Players</h1>
                        <p className="text-xs text-gray-400 tracking-widest uppercase mt-1">{players.length} registered</p>
                    </div>
                    <Button
                        onClick={() => window.location.href = '/league/join/player'}
                        className="h-10 md:h-9 text-xs"
                    >
                        + Add Player
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                        placeholder="Search players…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1"
                    />
                    <div className="flex gap-2 overflow-x-auto pb-1 -mb-1 scrollbar-none">
                        <button
                            onClick={() => setFilterTeam('')}
                            className={`flex-shrink-0 px-3 py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all ${!filterTeam ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                        >
                            All
                        </button>
                        {teams.map((team) => (
                            <button
                                key={team}
                                onClick={() => setFilterTeam(team!)}
                                className={`flex-shrink-0 px-3 py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all whitespace-nowrap ${filterTeam === team ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                            >
                                {team}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Player list */}
                {isLoading ? (
                    <div className="text-center py-20">
                        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto" />
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filtered.map((player, i) => (
                            <motion.div
                                key={player.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                            >
                                <Card className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-3 md:p-4">
                                        <div className="flex items-center gap-3 md:gap-4">
                                            {/* Jersey number */}
                                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-900 text-white flex items-center justify-center font-black text-sm md:text-base flex-shrink-0">
                                                {player.jersey_number || '–'}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm truncate">{player.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">{player.position}</span>
                                                    {player.team_name && (
                                                        <>
                                                            <span className="text-gray-200">·</span>
                                                            <span className="text-[10px] text-gray-400 truncate">{player.team_name}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Stats */}
                                            <div className="hidden sm:flex items-center gap-4 text-center">
                                                <div>
                                                    <p className="text-sm font-black">{player.stats?.goals || 0}</p>
                                                    <p className="text-[8px] tracking-widest uppercase text-gray-400">Goals</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black">{player.stats?.assists || 0}</p>
                                                    <p className="text-[8px] tracking-widest uppercase text-gray-400">Assists</p>
                                                </div>
                                            </div>

                                            {/* Status */}
                                            <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-full flex-shrink-0 ${statusColors[player.status] || 'bg-gray-100 text-gray-500'}`}>
                                                {player.status}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}

                        {filtered.length === 0 && (
                            <div className="text-center py-16">
                                <p className="text-4xl mb-4">👤</p>
                                <p className="text-sm text-gray-400">No players found</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </PageLayout>
    );
}
