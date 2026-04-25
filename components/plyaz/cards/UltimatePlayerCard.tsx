'use client';

import React, { useRef, useCallback } from 'react';
import Image from 'next/image';
import { cn, triggerHaptic } from '@/lib/utils';
import { motion } from 'framer-motion';
import { toBlob } from 'html-to-image';
import { Share2, Download } from 'lucide-react';

export interface UltimatePlayerCardProps {
    name: string;
    position: string;
    number: number;
    imageUrl?: string;
    teamColor?: string;
    overallRating?: number;
    stats?: {
        label: string;
        value: number | string;
    }[];
    variant?: 'gold' | 'silver' | 'bronze' | 'special';
    className?: string;
    showActions?: boolean;
}

export const UltimatePlayerCard = ({
    name,
    position,
    number,
    imageUrl,
    teamColor = '#F97316',
    overallRating = 75,
    stats = [],
    variant = 'special',
    className,
    showActions = false,
}: UltimatePlayerCardProps) => {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleDownload = useCallback(async () => {
        if (!cardRef.current) return;
        triggerHaptic('medium');
        try {
            const blob = await toBlob(cardRef.current, { quality: 0.95, pixelRatio: 2 });
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `PLYAZ-Card-${name.replace(/\s+/g, '-')}.png`;
            a.click();
            URL.revokeObjectURL(url);
            triggerHaptic('success');
        } catch (err) {
            console.error('Failed to download card', err);
        }
    }, [name]);

    const getVariantStyles = () => {
        switch (variant) {
            case 'gold': return 'bg-gradient-to-b from-yellow-100 to-yellow-600 border-yellow-400';
            case 'silver': return 'bg-gradient-to-b from-gray-100 to-gray-400 border-gray-300';
            case 'special': return 'bg-gradient-to-b from-neutral-900 to-black border-white/20';
            default: return 'bg-white border-gray-200';
        }
    };

    return (
        <div className={cn("flex flex-col gap-4", className)}>
            <motion.div
                ref={cardRef}
                whileHover={{ y: -5, scale: 1.02 }}
                className={cn(
                    "relative w-full max-w-[320px] aspect-[2/3] rounded-[2rem] p-1 shadow-2xl overflow-hidden group mx-auto",
                    getVariantStyles()
                )}
            >
                {/* Dynamic Team Background */}
                <div 
                    className="absolute inset-0 opacity-40 mix-blend-overlay transition-colors duration-700"
                    style={{ 
                        background: `radial-gradient(circle at 50% 30%, ${teamColor} 0%, transparent 70%)` 
                    }}
                />
                
                {/* Inner Card Frame */}
                <div className="relative w-full h-full bg-black/20 backdrop-blur-md rounded-[1.8rem] overflow-hidden border border-white/10 flex flex-col">
                    
                    {/* Top Section (Rating & Position) */}
                    <div className="p-6 flex flex-col items-start font-black leading-none text-white italic">
                        <span className="text-5xl tracking-tighter drop-shadow-lg">{overallRating}</span>
                        <span className="text-sm uppercase opacity-60 tracking-[0.2em] mt-1">{position}</span>
                        <div className="w-8 h-1 bg-white rounded-full mt-3 opacity-50" />
                    </div>

                    {/* Player Image / Placeholder */}
                    <div className="flex-1 relative mx-4 -mt-4">
                        {imageUrl ? (
                            <Image
                                src={imageUrl}
                                alt={name}
                                fill
                                className="object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)] z-10"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-9xl font-black text-white/5 select-none">
                                {number}
                            </div>
                        )}
                    </div>

                    {/* Stats & Name Section */}
                    <div className="p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                        <div className="mb-4 text-center">
                            <h3 className="text-white font-black text-2xl uppercase italic tracking-tighter leading-tight drop-shadow-md">{name}</h3>
                            <div className="h-1.5 w-12 mx-auto rounded-full mt-2" style={{ backgroundColor: teamColor }} />
                        </div>

                        <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
                            {stats.length > 0 ? stats.slice(0, 6).map((stat, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <span className="text-white font-black text-lg">{stat.value}</span>
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">{stat.label}</span>
                                </div>
                            )) : (
                                ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'].map((label) => (
                                    <div key={label} className="flex flex-col items-center">
                                        <span className="text-white font-black text-lg">--</span>
                                        <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">{label}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* FIFA-style Shine */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none" />
            </motion.div>

            {showActions && (
                <div className="flex justify-center gap-2">
                    <button 
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs font-black uppercase tracking-widest text-white transition-all border border-white/10"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Save Card
                    </button>
                    <button 
                        onClick={async () => {
                            triggerHaptic('medium');
                            if (navigator.share) {
                                try {
                                    const blob = await toBlob(cardRef.current!, { quality: 0.9 });
                                    const file = new File([blob!], 'player-card.png', { type: 'image/png' });
                                    await navigator.share({
                                        title: `${name} - PLYAZ Card`,
                                        files: [file]
                                    });
                                } catch (e) { console.error(e); }
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 rounded-full text-xs font-black uppercase tracking-widest text-primary transition-all border border-primary/20"
                    >
                        <Share2 className="w-3.5 h-3.5" />
                        Share
                    </button>
                </div>
            )}
        </div>
    );
};
