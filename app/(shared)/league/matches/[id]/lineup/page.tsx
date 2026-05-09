'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { PageLayout, PageHeader, Button, Badge } from '@/components/plyaz';
import { GripVertical, Check, RotateCcw, ChevronDown, ChevronLeft } from 'lucide-react';
import { usePlayers } from '@/lib/hooks';
import type { Player } from '@/types';

/**
 * Pitch Lineup Builder
 * Drag-and-drop formation editor that adapts to 5/7/11-a-side formats.
 */

type GameFormat = '5-a-side' | '7-a-side' | '11-a-side';

interface PlayerSlot {
    id: string;
    name: string;
    position: string;
    number: number;
    avatar?: string;
}

interface FormationPosition {
    x: number; // percentage from left
    y: number; // percentage from top
    role: string;
    player: PlayerSlot | null;
}

// Formation templates per format
const FORMATIONS: Record<GameFormat, Record<string, FormationPosition[]>> = {
    '5-a-side': {
        '1-2-1': [
            { x: 50, y: 85, role: 'GK', player: null },
            { x: 25, y: 55, role: 'DEF', player: null },
            { x: 75, y: 55, role: 'DEF', player: null },
            { x: 50, y: 35, role: 'MID', player: null },
            { x: 50, y: 15, role: 'FWD', player: null },
        ],
        '2-2': [
            { x: 50, y: 85, role: 'GK', player: null },
            { x: 30, y: 60, role: 'DEF', player: null },
            { x: 70, y: 60, role: 'DEF', player: null },
            { x: 30, y: 30, role: 'FWD', player: null },
            { x: 70, y: 30, role: 'FWD', player: null },
        ],
    },
    '7-a-side': {
        '2-3-1': [
            { x: 50, y: 88, role: 'GK', player: null },
            { x: 30, y: 70, role: 'CB', player: null },
            { x: 70, y: 70, role: 'CB', player: null },
            { x: 20, y: 45, role: 'LM', player: null },
            { x: 50, y: 42, role: 'CM', player: null },
            { x: 80, y: 45, role: 'RM', player: null },
            { x: 50, y: 18, role: 'ST', player: null },
        ],
        '3-2-1': [
            { x: 50, y: 88, role: 'GK', player: null },
            { x: 20, y: 68, role: 'LB', player: null },
            { x: 50, y: 70, role: 'CB', player: null },
            { x: 80, y: 68, role: 'RB', player: null },
            { x: 35, y: 40, role: 'CM', player: null },
            { x: 65, y: 40, role: 'CM', player: null },
            { x: 50, y: 18, role: 'ST', player: null },
        ],
    },
    '11-a-side': {
        '4-3-3': [
            { x: 50, y: 90, role: 'GK', player: null },
            { x: 15, y: 72, role: 'LB', player: null },
            { x: 38, y: 74, role: 'CB', player: null },
            { x: 62, y: 74, role: 'CB', player: null },
            { x: 85, y: 72, role: 'RB', player: null },
            { x: 28, y: 50, role: 'CM', player: null },
            { x: 50, y: 46, role: 'CM', player: null },
            { x: 72, y: 50, role: 'CM', player: null },
            { x: 18, y: 25, role: 'LW', player: null },
            { x: 50, y: 18, role: 'ST', player: null },
            { x: 82, y: 25, role: 'RW', player: null },
        ],
        '4-4-2': [
            { x: 50, y: 90, role: 'GK', player: null },
            { x: 15, y: 72, role: 'LB', player: null },
            { x: 38, y: 74, role: 'CB', player: null },
            { x: 62, y: 74, role: 'CB', player: null },
            { x: 85, y: 72, role: 'RB', player: null },
            { x: 15, y: 48, role: 'LM', player: null },
            { x: 38, y: 50, role: 'CM', player: null },
            { x: 62, y: 50, role: 'CM', player: null },
            { x: 85, y: 48, role: 'RM', player: null },
            { x: 35, y: 22, role: 'ST', player: null },
            { x: 65, y: 22, role: 'ST', player: null },
        ],
        '3-5-2': [
            { x: 50, y: 90, role: 'GK', player: null },
            { x: 25, y: 74, role: 'CB', player: null },
            { x: 50, y: 76, role: 'CB', player: null },
            { x: 75, y: 74, role: 'CB', player: null },
            { x: 10, y: 48, role: 'LWB', player: null },
            { x: 35, y: 50, role: 'CM', player: null },
            { x: 50, y: 46, role: 'CDM', player: null },
            { x: 65, y: 50, role: 'CM', player: null },
            { x: 90, y: 48, role: 'RWB', player: null },
            { x: 35, y: 20, role: 'ST', player: null },
            { x: 65, y: 20, role: 'ST', player: null },
        ],
    },
};

export default function LineupBuilderPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const { data: match } = useQuery({
        queryKey: ['match', id],
        queryFn: () => fetch(`/api/league/matches/${id}`).then((r) => r.json()),
        enabled: !!id,
    });

    const { data: players = [], isLoading: playersLoading } = usePlayers(match?.home_team_id ?? '');

    const squad: PlayerSlot[] = (players as Player[]).map((player) => ({
        id: player.id,
        name: player.name,
        position: player.position ?? 'PLAYER',
        number: player.jersey_number ?? 0,
    }));

    const [gameFormat, setGameFormat] = useState<GameFormat>('11-a-side');
    const [formationName, setFormationName] = useState('4-3-3');
    const [formation, setFormation] = useState<FormationPosition[]>(
        FORMATIONS['11-a-side']['4-3-3'].map((p) => ({ ...p })),
    );
    const [selectedPitchIndex, setSelectedPitchIndex] = useState<number | null>(null);
    const [isPublished, setIsPublished] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [showFormationPicker, setShowFormationPicker] = useState(false);

    const assignedPlayerIds = formation.map((p) => p.player?.id).filter(Boolean);
    const availablePlayers = squad.filter((p) => !assignedPlayerIds.includes(p.id));
    const formatSize = gameFormat === '5-a-side' ? 5 : gameFormat === '7-a-side' ? 7 : 11;

    const handleFormatChange = useCallback((format: GameFormat) => {
        setGameFormat(format);
        const formationKeys = Object.keys(FORMATIONS[format]);
        const defaultFormation = formationKeys[0];
        setFormationName(defaultFormation);
        setFormation(FORMATIONS[format][defaultFormation].map((p) => ({ ...p })));
        setSelectedPitchIndex(null);
        setIsPublished(false);
    }, []);

    const handleFormationChange = useCallback(
        (name: string) => {
            setFormationName(name);
            setFormation(FORMATIONS[gameFormat][name].map((p) => ({ ...p })));
            setSelectedPitchIndex(null);
            setShowFormationPicker(false);
        },
        [gameFormat],
    );

    const handlePitchSlotClick = (index: number) => {
        if (formation[index].player) {
            // Remove player from position
            const newFormation = [...formation];
            newFormation[index] = { ...newFormation[index], player: null };
            setFormation(newFormation);
            setSelectedPitchIndex(null);
        } else {
            setSelectedPitchIndex(index);
        }
    };

    const handlePlayerAssign = (player: PlayerSlot) => {
        if (selectedPitchIndex === null) return;
        const newFormation = [...formation];
        newFormation[selectedPitchIndex] = { ...newFormation[selectedPitchIndex], player };
        setFormation(newFormation);
        setSelectedPitchIndex(null);
    };

    const handleReset = () => {
        setFormation(FORMATIONS[gameFormat][formationName].map((p) => ({ ...p })));
        setSelectedPitchIndex(null);
        setIsPublished(false);
    };

    const handlePublish = async () => {
        setIsPublishing(true);
        try {
            await fetch(`/api/league/matches/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lineup: formation.map((pos) => ({
                        role: pos.role,
                        player_id: pos.player?.id ?? null,
                    })),
                }),
            });
            setIsPublished(true);
            setSelectedPitchIndex(null);
        } finally {
            setIsPublishing(false);
        }
    };

    const filledCount = formation.filter((p) => p.player).length;

    if (playersLoading) {
        return (
            <PageLayout title="LINEUP">
                <div className="h-20 animate-pulse rounded-2xl bg-gray-100" />
            </PageLayout>
        );
    }

    return (
        <PageLayout title="LINEUP">
            <button
                onClick={() => router.back()}
                className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 transition-colors hover:text-orange-500"
            >
                <ChevronLeft className="h-4 w-4" /> Back to Match
            </button>

            <PageHeader
                label="Match Preparation"
                title="Build Lineup"
                description="Select your formation and drag players into position."
            />

            <div className="max-w-4xl pb-24">
                {/* Format Selector */}
                <div className="mb-6 flex rounded-2xl bg-gray-100 p-1">
                    {(['5-a-side', '7-a-side', '11-a-side'] as const).map((format) => (
                        <button
                            key={format}
                            onClick={() => handleFormatChange(format)}
                            className={`flex-1 rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all ${
                                gameFormat === format
                                    ? 'bg-black text-white shadow-lg'
                                    : 'text-gray-400'
                            }`}
                        >
                            {format}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
                    {/* Pitch */}
                    <div className="relative">
                        {/* Formation Selector */}
                        <div className="absolute left-3 top-3 z-10">
                            <button
                                onClick={() => setShowFormationPicker(!showFormationPicker)}
                                className="flex items-center gap-2 rounded-xl bg-black/60 px-4 py-2 text-xs font-black tracking-widest text-white backdrop-blur-sm"
                            >
                                {formationName} <ChevronDown className="h-3 w-3" />
                            </button>
                            <AnimatePresence>
                                {showFormationPicker && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        className="absolute left-0 top-full mt-2 overflow-hidden rounded-xl bg-black/90 shadow-xl backdrop-blur-md"
                                    >
                                        {Object.keys(FORMATIONS[gameFormat]).map((name) => (
                                            <button
                                                key={name}
                                                onClick={() => handleFormationChange(name)}
                                                className={`block w-full px-5 py-3 text-left text-xs font-bold tracking-widest transition-colors ${
                                                    formationName === name
                                                        ? 'bg-orange-500 text-white'
                                                        : 'text-white/70 hover:bg-white/10'
                                                }`}
                                            >
                                                {name}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Progress indicator */}
                        <div className="absolute right-3 top-3 z-10 rounded-xl bg-black/60 px-4 py-2 backdrop-blur-sm">
                            <span
                                className={`text-xs font-black tracking-widest ${filledCount === formatSize ? 'text-green-400' : 'text-white/70'}`}
                            >
                                {filledCount}/{formatSize}
                            </span>
                        </div>

                        {/* Pitch SVG */}
                        <div className="relative aspect-[3/4] overflow-hidden rounded-3xl border border-green-600/20 bg-gradient-to-b from-green-700 via-green-800 to-green-900 shadow-2xl">
                            {/* Field markings */}
                            <div className="absolute inset-4 rounded-xl border-2 border-white/15" />
                            <div className="absolute bottom-0 left-1/2 top-0 w-0.5 -translate-x-1/2 bg-white/10" />
                            <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/10" />
                            <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20" />
                            {/* Penalty areas */}
                            <div className="absolute left-1/2 top-4 h-20 w-36 -translate-x-1/2 rounded-sm border-2 border-white/10" />
                            <div className="absolute left-1/2 top-4 h-8 w-16 -translate-x-1/2 rounded-sm border-2 border-white/10" />
                            <div className="absolute bottom-4 left-1/2 h-20 w-36 -translate-x-1/2 rounded-sm border-2 border-white/10" />
                            <div className="absolute bottom-4 left-1/2 h-8 w-16 -translate-x-1/2 rounded-sm border-2 border-white/10" />

                            {/* Player positions */}
                            {formation.map((pos, i) => (
                                <motion.button
                                    key={i}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.04, type: 'spring' }}
                                    onClick={() => handlePitchSlotClick(i)}
                                    className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                                >
                                    <div
                                        className={`flex h-11 w-11 items-center justify-center rounded-full text-xs font-black shadow-xl transition-all ${
                                            pos.player
                                                ? 'bg-white text-gray-900 group-hover:ring-2 group-hover:ring-orange-400'
                                                : selectedPitchIndex === i
                                                  ? 'animate-pulse bg-orange-500 text-white ring-4 ring-orange-300/50'
                                                  : 'border-2 border-dashed border-white/30 bg-white/20 text-white/60 group-hover:border-orange-400 group-hover:text-orange-400'
                                        }`}
                                    >
                                        {pos.player ? pos.player.number : '+'}
                                    </div>
                                    <span
                                        className={`mt-1 text-[8px] font-bold transition-colors ${
                                            pos.player ? 'text-white/90' : 'text-white/40'
                                        }`}
                                    >
                                        {pos.player ? pos.player.name.split(' ').pop() : pos.role}
                                    </span>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Squad Sidebar */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                                Available Squad
                            </h3>
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-1 text-xs text-gray-400 hover:text-orange-500"
                            >
                                <RotateCcw className="h-3 w-3" /> Reset
                            </button>
                        </div>

                        {selectedPitchIndex !== null && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-2xl border border-orange-200 bg-orange-50 p-3 text-center"
                            >
                                <p className="text-xs font-bold text-orange-600">
                                    Tap a player below to assign to{' '}
                                    <span className="font-black">
                                        {formation[selectedPitchIndex].role}
                                    </span>
                                </p>
                            </motion.div>
                        )}

                        <div className="max-h-[500px] space-y-2 overflow-y-auto pr-1">
                            {availablePlayers.map((player) => (
                                <motion.div
                                    key={player.id}
                                    layout
                                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-all ${
                                        selectedPitchIndex !== null
                                            ? 'border-orange-200 bg-white hover:border-orange-400 hover:bg-orange-50'
                                            : 'border-gray-100 bg-white opacity-60'
                                    }`}
                                    onClick={() => handlePlayerAssign(player)}
                                >
                                    <GripVertical className="h-4 w-4 flex-shrink-0 text-gray-300" />
                                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-black text-white">
                                        {player.number}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-bold text-gray-900">
                                            {player.name}
                                        </p>
                                        <p className="text-[10px] font-bold uppercase text-gray-400">
                                            {player.position}
                                        </p>
                                    </div>
                                    <Badge variant="secondary" className="text-[8px]">
                                        {player.position}
                                    </Badge>
                                </motion.div>
                            ))}
                            {availablePlayers.length === 0 && (
                                <div className="py-8 text-center text-gray-300">
                                    <p className="text-sm font-bold">All players assigned</p>
                                    <p className="mt-1 text-xs text-gray-400">
                                        Tap a player on the pitch to remove
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Bench section */}
                        {filledCount === formatSize && availablePlayers.length > 0 && (
                            <div>
                                <h4 className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                    Bench ({availablePlayers.length})
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {availablePlayers.slice(0, 7).map((p) => (
                                        <div
                                            key={p.id}
                                            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-500"
                                            title={p.name}
                                        >
                                            {p.number}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Publish Button */}
                        <div className="space-y-3 pt-4">
                            <Button
                                fullWidth
                                className={`h-14 rounded-2xl text-sm font-black tracking-widest transition-all ${
                                    isPublished ? 'bg-green-600 text-white' : 'bg-black text-white'
                                }`}
                                onClick={handlePublish}
                                disabled={filledCount < formatSize || isPublishing}
                            >
                                {isPublished ? (
                                    <>
                                        <Check className="mr-2 h-5 w-5" /> LINEUP PUBLISHED
                                    </>
                                ) : isPublishing ? (
                                    'PUBLISHING…'
                                ) : (
                                    `CONFIRM LINEUP (${filledCount}/${formatSize})`
                                )}
                            </Button>
                            {filledCount < formatSize && (
                                <p className="text-center text-[10px] font-bold text-gray-400">
                                    Assign {formatSize - filledCount} more player
                                    {formatSize - filledCount > 1 ? 's' : ''} to confirm
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
