'use client';

import React, { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toBlob } from 'html-to-image';
import { triggerHaptic, cn } from '@/lib/utils';

interface ShareableMatchCardProps {
    homeTeam: { name: string; shortName?: string; logoUrl?: string };
    awayTeam: { name: string; shortName?: string; logoUrl?: string };
    homeScore: number;
    awayScore: number;
    competition: string;
    date: string;
    venue?: string;
    matchday?: string;
}

export const ShareableMatchCard: React.FC<ShareableMatchCardProps> = ({
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    competition,
    date,
    venue,
    matchday: _matchday,
}) => {
    const cardRef = useRef<HTMLDivElement>(null);

    const downloadImage = useCallback(
        (blob: Blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${homeTeam.shortName || homeTeam.name}-vs-${awayTeam.shortName || awayTeam.name}.png`;
            a.click();
            URL.revokeObjectURL(url);
            triggerHaptic('success');
        },
        [homeTeam.name, homeTeam.shortName, awayTeam.name, awayTeam.shortName],
    );

    const handleShare = useCallback(async () => {
        if (!cardRef.current) return;

        try {
            const blob = await toBlob(cardRef.current, {
                quality: 0.95,
                pixelRatio: 2,
            });

            if (!blob) return;

            const isShareSupported = typeof navigator !== 'undefined' && !!navigator.share;
            const isCanShareSupported =
                typeof navigator !== 'undefined' && typeof navigator.canShare === 'function';

            if (isShareSupported && isCanShareSupported) {
                const file = new File(
                    [blob],
                    `${homeTeam.shortName || homeTeam.name}-vs-${awayTeam.shortName || awayTeam.name}.png`,
                    { type: 'image/png' },
                );
                const shareData = {
                    title: `${homeTeam.name} vs ${awayTeam.name}`,
                    text: `${homeTeam.name} ${homeScore} - ${awayScore} ${awayTeam.name} | ${competition}`,
                    files: [file],
                };

                if (navigator.canShare(shareData)) {
                    await navigator.share(shareData);
                    triggerHaptic('success');
                } else {
                    downloadImage(blob);
                }
            } else {
                downloadImage(blob);
            }
        } catch (error) {
            console.error('Share failed', error);
            const text = `${homeTeam.name} ${homeScore} - ${awayScore} ${awayTeam.name} | ${competition} | ${date}`;
            await navigator.clipboard.writeText(text);
            triggerHaptic('medium');
            alert('Match result copied to clipboard!');
        }
    }, [homeTeam, awayTeam, homeScore, awayScore, competition, date, downloadImage]);

    const winner = homeScore > awayScore ? 'home' : awayScore > homeScore ? 'away' : 'draw';

    return (
        <div className="space-y-4" data-testid="shareable-match-card">
            {/* The shareable card */}
            <div
                ref={cardRef}
                className="relative mx-auto aspect-[4/5] w-full max-w-[400px] overflow-hidden rounded-[2.5rem] bg-black"
            >
                {/* Visual Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-orange-500/20 blur-[100px]" />
                    <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-blue-500/10 blur-[100px]" />
                </div>

                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] mix-blend-overlay" />

                <div className="relative z-10 flex h-full flex-col px-8 py-12">
                    {/* Header */}
                    <div className="mb-10 text-center">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 shadow-xl backdrop-blur-md">
                            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
                                Final Result
                            </span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
                            {competition}
                        </p>
                    </div>

                    {/* Score section */}
                    <div className="flex flex-1 flex-col justify-center">
                        <div className="mb-12 flex items-center justify-between gap-4">
                            {/* Home */}
                            <div className="flex-1 text-center">
                                <div
                                    className={cn(
                                        'mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[2rem] transition-all duration-500',
                                        winner === 'home'
                                            ? 'bg-orange-500 shadow-2xl shadow-orange-500/40 ring-4 ring-orange-500/20'
                                            : 'border border-white/10 bg-white/5',
                                    )}
                                >
                                    {homeTeam.logoUrl ? (
                                        <img
                                            src={homeTeam.logoUrl}
                                            alt=""
                                            className="h-full w-full rounded-[2rem] object-cover"
                                        />
                                    ) : (
                                        <span className="text-3xl font-black text-white">
                                            {(homeTeam.shortName || homeTeam.name)[0]}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs font-black uppercase tracking-widest text-white">
                                    {homeTeam.shortName || homeTeam.name}
                                </p>
                            </div>

                            {/* Score */}
                            <div className="px-4 text-center">
                                <div className="flex items-center gap-4">
                                    <span className="text-6xl font-black tracking-tighter text-white drop-shadow-2xl">
                                        {homeScore}
                                    </span>
                                    <span className="text-2xl font-black text-white/20">:</span>
                                    <span className="text-6xl font-black tracking-tighter text-white drop-shadow-2xl">
                                        {awayScore}
                                    </span>
                                </div>
                            </div>

                            {/* Away */}
                            <div className="flex-1 text-center">
                                <div
                                    className={cn(
                                        'mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[2rem] transition-all duration-500',
                                        winner === 'away'
                                            ? 'bg-orange-500 shadow-2xl shadow-orange-500/40 ring-4 ring-orange-500/20'
                                            : 'border border-white/10 bg-white/5',
                                    )}
                                >
                                    {awayTeam.logoUrl ? (
                                        <img
                                            src={awayTeam.logoUrl}
                                            alt=""
                                            className="h-full w-full rounded-[2rem] object-cover"
                                        />
                                    ) : (
                                        <span className="text-3xl font-black text-white">
                                            {(awayTeam.shortName || awayTeam.name)[0]}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs font-black uppercase tracking-widest text-white">
                                    {awayTeam.shortName || awayTeam.name}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-8">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                                {date}
                            </p>
                            {venue && (
                                <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/20">
                                    {venue}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/20">
                                <svg
                                    className="h-4 w-4 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                </svg>
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.3em] text-white">
                                PLYAZ
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Share button */}
            <motion.button
                onClick={handleShare}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mx-auto flex w-full max-w-[400px] items-center justify-center gap-3 rounded-2xl border-b-4 border-orange-700 bg-orange-500 px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-orange-500/20 transition-all hover:bg-orange-600 active:translate-y-1 active:border-b-0"
                data-testid="share-match-btn"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                </svg>
                Share Story
            </motion.button>
        </div>
    );
};

export default ShareableMatchCard;
