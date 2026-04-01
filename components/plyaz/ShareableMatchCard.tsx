'use client';

import React, { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface ShareableMatchCardProps {
    homeTeam: { name: string; shortName?: string; };
    awayTeam: { name: string; shortName?: string; };
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
    matchday,
}) => {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleShare = useCallback(async () => {
        if (!cardRef.current) return;

        try {
            // Use html2canvas to capture the card
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: null,
                scale: 2,
                useCORS: true,
            });

            canvas.toBlob(async (blob) => {
                if (!blob) return;

                if (navigator.share && navigator.canShare) {
                    const file = new File([blob], `${homeTeam.shortName || homeTeam.name}-vs-${awayTeam.shortName || awayTeam.name}.png`, { type: 'image/png' });
                    try {
                        await navigator.share({
                            title: `${homeTeam.name} vs ${awayTeam.name}`,
                            text: `${homeTeam.name} ${homeScore} - ${awayScore} ${awayTeam.name} | ${competition}`,
                            files: [file],
                        });
                    } catch {
                        downloadImage(blob);
                    }
                } else {
                    downloadImage(blob);
                }
            }, 'image/png');
        } catch {
            // Fallback: copy text
            const text = `${homeTeam.name} ${homeScore} - ${awayScore} ${awayTeam.name} | ${competition} | ${date}`;
            await navigator.clipboard.writeText(text);
            alert('Match result copied to clipboard!');
        }
    }, [homeTeam, awayTeam, homeScore, awayScore, competition, date]);

    const downloadImage = (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${homeTeam.shortName || homeTeam.name}-vs-${awayTeam.shortName || awayTeam.name}.png`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const winner = homeScore > awayScore ? 'home' : awayScore > homeScore ? 'away' : 'draw';

    return (
        <div className="space-y-4" data-testid="shareable-match-card">
            {/* The shareable card */}
            <div
                ref={cardRef}
                className="relative w-full max-w-md mx-auto overflow-hidden rounded-2xl"
                style={{
                    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
                }}
            >
                {/* Dot pattern overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                        backgroundSize: '16px 16px',
                    }}
                />

                {/* Orange accent glow */}
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full opacity-20 blur-3xl"
                    style={{ background: 'radial-gradient(circle, #FF5C1A 0%, transparent 70%)' }}
                />

                <div className="relative z-10 px-8 py-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full mb-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            <span className="text-[9px] font-bold tracking-[0.2em] text-white/60 uppercase">
                                Full Time
                            </span>
                        </div>
                        <p className="text-[10px] font-semibold tracking-[0.2em] text-white/30 uppercase">
                            {competition}
                        </p>
                        {matchday && (
                            <p className="text-[9px] font-medium tracking-[0.15em] text-white/20 uppercase mt-1">
                                {matchday}
                            </p>
                        )}
                    </div>

                    {/* Score section */}
                    <div className="flex items-center justify-between gap-4 mb-8">
                        {/* Home */}
                        <div className="flex-1 text-center">
                            <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3 ${winner === 'home' ? 'bg-orange-500/20 ring-1 ring-orange-500/30' : 'bg-white/5'}`}>
                                <span className={`text-2xl font-black ${winner === 'home' ? 'text-orange-400' : 'text-white/60'}`}>
                                    {(homeTeam.shortName || homeTeam.name)[0]}
                                </span>
                            </div>
                            <p className={`text-xs font-bold tracking-wider ${winner === 'home' ? 'text-white' : 'text-white/60'}`}>
                                {homeTeam.shortName || homeTeam.name}
                            </p>
                        </div>

                        {/* Score */}
                        <div className="text-center px-6">
                            <div className="flex items-baseline gap-3">
                                <span className={`text-5xl font-black tracking-tighter ${winner === 'home' ? 'text-white' : 'text-white/50'}`}>
                                    {homeScore}
                                </span>
                                <span className="text-xl text-white/10 font-light">:</span>
                                <span className={`text-5xl font-black tracking-tighter ${winner === 'away' ? 'text-white' : 'text-white/50'}`}>
                                    {awayScore}
                                </span>
                            </div>
                        </div>

                        {/* Away */}
                        <div className="flex-1 text-center">
                            <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3 ${winner === 'away' ? 'bg-orange-500/20 ring-1 ring-orange-500/30' : 'bg-white/5'}`}>
                                <span className={`text-2xl font-black ${winner === 'away' ? 'text-orange-400' : 'text-white/60'}`}>
                                    {(awayTeam.shortName || awayTeam.name)[0]}
                                </span>
                            </div>
                            <p className={`text-xs font-bold tracking-wider ${winner === 'away' ? 'text-white' : 'text-white/60'}`}>
                                {awayTeam.shortName || awayTeam.name}
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-white/[0.05] flex items-center justify-between">
                        <div>
                            <p className="text-[9px] font-medium tracking-[0.15em] text-white/20 uppercase">{date}</p>
                            {venue && <p className="text-[9px] font-medium tracking-[0.1em] text-white/15 uppercase mt-0.5">{venue}</p>}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 bg-white/5 rounded flex items-center justify-center">
                                <svg className="w-3 h-3 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                </svg>
                            </div>
                            <span className="text-[9px] font-black tracking-[0.2em] text-white/30 uppercase">PLYAZ</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Share button */}
            <motion.button
                onClick={handleShare}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full max-w-md mx-auto flex items-center justify-center gap-2 py-3 px-6 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-bold tracking-wider uppercase rounded-xl transition-colors"
                data-testid="share-match-btn"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share Result
            </motion.button>
        </div>
    );
};

export default ShareableMatchCard;
