'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageLayout, PageHeader, Button, Badge } from '@/components/plyaz';
import { adminNavItems } from '@/lib/constants/navigation';
import { GripVertical, Check, RotateCcw, ChevronDown } from 'lucide-react';

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

// Mock squad roster
const MOCK_SQUAD: PlayerSlot[] = [
    { id: 'p1', name: 'D. Silva', position: 'GK', number: 1 },
    { id: 'p2', name: 'T. Walker', position: 'RB', number: 2 },
    { id: 'p3', name: 'A. Cole', position: 'LB', number: 3 },
    { id: 'p4', name: 'R. Keane', position: 'CB', number: 4 },
    { id: 'p5', name: 'J. Stones', position: 'CB', number: 5 },
    { id: 'p6', name: 'M. Salah', position: 'RW', number: 6 },
    { id: 'p7', name: 'N. Kanté', position: 'CM', number: 7 },
    { id: 'p8', name: 'L. Modric', position: 'CM', number: 8 },
    { id: 'p9', name: 'M. Rivera', position: 'ST', number: 9 },
    { id: 'p10', name: 'K. De Bruyne', position: 'CAM', number: 10 },
    { id: 'p11', name: 'S. Mané', position: 'LW', number: 11 },
    { id: 'p12', name: 'C. Peres', position: 'GK', number: 12 },
    { id: 'p13', name: 'V. Lindelöf', position: 'CB', number: 13 },
    { id: 'p14', name: 'F. Henderson', position: 'CM', number: 14 },
    { id: 'p15', name: 'H. Maguire', position: 'CB', number: 15 },
    { id: 'p16', name: 'B. Fernandes', position: 'CAM', number: 16 },
    { id: 'p17', name: 'J. Lingard', position: 'RW', number: 17 },
    { id: 'p18', name: 'A. Martial', position: 'ST', number: 18 },
];

export default function LineupBuilderPage() {
    const [gameFormat, setGameFormat] = useState<GameFormat>('11-a-side');
    const [formationName, setFormationName] = useState('4-3-3');
    const [formation, setFormation] = useState<FormationPosition[]>(
        FORMATIONS['11-a-side']['4-3-3'].map(p => ({ ...p }))
    );
    const [selectedPitchIndex, setSelectedPitchIndex] = useState<number | null>(null);
    const [isPublished, setIsPublished] = useState(false);
    const [showFormationPicker, setShowFormationPicker] = useState(false);

    const assignedPlayerIds = formation.map(p => p.player?.id).filter(Boolean);
    const availablePlayers = MOCK_SQUAD.filter(p => !assignedPlayerIds.includes(p.id));
    const formatSize = gameFormat === '5-a-side' ? 5 : gameFormat === '7-a-side' ? 7 : 11;

    const handleFormatChange = useCallback((format: GameFormat) => {
        setGameFormat(format);
        const formationKeys = Object.keys(FORMATIONS[format]);
        const defaultFormation = formationKeys[0];
        setFormationName(defaultFormation);
        setFormation(FORMATIONS[format][defaultFormation].map(p => ({ ...p })));
        setSelectedPitchIndex(null);
        setIsPublished(false);
    }, []);

    const handleFormationChange = useCallback((name: string) => {
        setFormationName(name);
        setFormation(FORMATIONS[gameFormat][name].map(p => ({ ...p })));
        setSelectedPitchIndex(null);
        setShowFormationPicker(false);
    }, [gameFormat]);

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
        setFormation(FORMATIONS[gameFormat][formationName].map(p => ({ ...p })));
        setSelectedPitchIndex(null);
        setIsPublished(false);
    };

    const handlePublish = () => {
        setIsPublished(true);
        setSelectedPitchIndex(null);
    };

    const filledCount = formation.filter(p => p.player).length;

    return (
        <PageLayout navItems={adminNavItems} title="LINEUP">
            <PageHeader
                label="Match Preparation"
                title="Build Lineup"
                description="Select your formation and drag players into position."
            />

            <div className="max-w-4xl pb-24">
                {/* Format Selector */}
                <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
                    {(['5-a-side', '7-a-side', '11-a-side'] as const).map((format) => (
                        <button
                            key={format}
                            onClick={() => handleFormatChange(format)}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${gameFormat === format ? 'bg-black text-white shadow-lg' : 'text-gray-400'
                                }`}
                        >
                            {format}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                    {/* Pitch */}
                    <div className="relative">
                        {/* Formation Selector */}
                        <div className="absolute top-3 left-3 z-10">
                            <button
                                onClick={() => setShowFormationPicker(!showFormationPicker)}
                                className="bg-black/60 backdrop-blur-sm text-white rounded-xl px-4 py-2 text-xs font-black tracking-widest flex items-center gap-2"
                            >
                                {formationName} <ChevronDown className="w-3 h-3" />
                            </button>
                            <AnimatePresence>
                                {showFormationPicker && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        className="absolute top-full left-0 mt-2 bg-black/90 backdrop-blur-md rounded-xl overflow-hidden shadow-xl"
                                    >
                                        {Object.keys(FORMATIONS[gameFormat]).map((name) => (
                                            <button
                                                key={name}
                                                onClick={() => handleFormationChange(name)}
                                                className={`block w-full px-5 py-3 text-left text-xs font-bold tracking-widest transition-colors ${formationName === name ? 'bg-orange-500 text-white' : 'text-white/70 hover:bg-white/10'
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
                        <div className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2">
                            <span className={`text-xs font-black tracking-widest ${filledCount === formatSize ? 'text-green-400' : 'text-white/70'}`}>
                                {filledCount}/{formatSize}
                            </span>
                        </div>

                        {/* Pitch SVG */}
                        <div className="relative aspect-[3/4] bg-gradient-to-b from-green-700 via-green-800 to-green-900 rounded-3xl overflow-hidden border border-green-600/20 shadow-2xl">
                            {/* Field markings */}
                            <div className="absolute inset-4 border-2 border-white/15 rounded-xl" />
                            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/10 -translate-x-1/2" />
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-white/10" />
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/20" />
                            {/* Penalty areas */}
                            <div className="absolute left-1/2 -translate-x-1/2 top-4 w-36 h-20 border-2 border-white/10 rounded-sm" />
                            <div className="absolute left-1/2 -translate-x-1/2 top-4 w-16 h-8 border-2 border-white/10 rounded-sm" />
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-4 w-36 h-20 border-2 border-white/10 rounded-sm" />
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-4 w-16 h-8 border-2 border-white/10 rounded-sm" />

                            {/* Player positions */}
                            {formation.map((pos, i) => (
                                <motion.button
                                    key={i}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.04, type: 'spring' }}
                                    onClick={() => handlePitchSlotClick(i)}
                                    className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2 group"
                                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                                >
                                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xs font-black shadow-xl transition-all ${pos.player
                                        ? 'bg-white text-gray-900 group-hover:ring-2 group-hover:ring-orange-400'
                                        : selectedPitchIndex === i
                                            ? 'bg-orange-500 text-white ring-4 ring-orange-300/50 animate-pulse'
                                            : 'bg-white/20 text-white/60 border-2 border-dashed border-white/30 group-hover:border-orange-400 group-hover:text-orange-400'
                                        }`}>
                                        {pos.player ? pos.player.number : '+'}
                                    </div>
                                    <span className={`text-[8px] font-bold mt-1 transition-colors ${pos.player ? 'text-white/90' : 'text-white/40'
                                        }`}>
                                        {pos.player ? pos.player.name.split(' ').pop() : pos.role}
                                    </span>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Squad Sidebar */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase">Available Squad</h3>
                            <button onClick={handleReset} className="text-xs text-gray-400 hover:text-orange-500 flex items-center gap-1">
                                <RotateCcw className="w-3 h-3" /> Reset
                            </button>
                        </div>

                        {selectedPitchIndex !== null && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-orange-50 border border-orange-200 rounded-2xl p-3 text-center"
                            >
                                <p className="text-xs font-bold text-orange-600">
                                    Tap a player below to assign to <span className="font-black">{formation[selectedPitchIndex].role}</span>
                                </p>
                            </motion.div>
                        )}

                        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                            {availablePlayers.map((player) => (
                                <motion.div
                                    key={player.id}
                                    layout
                                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${selectedPitchIndex !== null
                                        ? 'bg-white border-orange-200 hover:bg-orange-50 hover:border-orange-400'
                                        : 'bg-white border-gray-100 opacity-60'
                                        }`}
                                    onClick={() => handlePlayerAssign(player)}
                                >
                                    <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
                                    <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-xs font-black text-white flex-shrink-0">
                                        {player.number}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-bold text-gray-900 truncate">{player.name}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{player.position}</p>
                                    </div>
                                    <Badge variant="secondary" className="text-[8px]">{player.position}</Badge>
                                </motion.div>
                            ))}
                            {availablePlayers.length === 0 && (
                                <div className="text-center py-8 text-gray-300">
                                    <p className="text-sm font-bold">All players assigned</p>
                                    <p className="text-xs text-gray-400 mt-1">Tap a player on the pitch to remove</p>
                                </div>
                            )}
                        </div>

                        {/* Bench section */}
                        {filledCount === formatSize && availablePlayers.length > 0 && (
                            <div>
                                <h4 className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase mb-2">🪑 Bench ({availablePlayers.length})</h4>
                                <div className="flex flex-wrap gap-2">
                                    {availablePlayers.slice(0, 7).map(p => (
                                        <div key={p.id} className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500" title={p.name}>
                                            {p.number}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Publish Button */}
                        <div className="pt-4 space-y-3">
                            <Button
                                fullWidth
                                className={`h-14 rounded-2xl font-black tracking-widest text-sm transition-all ${isPublished ? 'bg-green-600 text-white' : 'bg-black text-white'
                                    }`}
                                onClick={handlePublish}
                                disabled={filledCount < formatSize}
                            >
                                {isPublished ? (
                                    <><Check className="w-5 h-5 mr-2" /> LINEUP PUBLISHED</>
                                ) : (
                                    `CONFIRM LINEUP (${filledCount}/${formatSize})`
                                )}
                            </Button>
                            {filledCount < formatSize && (
                                <p className="text-[10px] text-gray-400 text-center font-bold">
                                    Assign {formatSize - filledCount} more player{formatSize - filledCount > 1 ? 's' : ''} to confirm
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
