'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface UltimatePlayerCardProps {
    name: string;
    position: string;
    number: number;
    imageUrl?: string;
    overallRating?: number;
    stats?: {
        label: string;
        value: number | string;
    }[];
    variant?: 'gold' | 'silver' | 'bronze' | 'special';
    className?: string;
    onClick?: () => void;
}

export const UltimatePlayerCard = ({
    name,
    position,
    number,
    imageUrl,
    overallRating = 75,
    stats = [],
    variant = 'special',
    className,
    onClick,
}: UltimatePlayerCardProps) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'gold': return 'bg-gradient-to-b from-yellow-100 to-yellow-600 border-yellow-400';
            case 'silver': return 'bg-gradient-to-b from-gray-100 to-gray-400 border-gray-300';
            case 'special': return 'bg-gradient-to-b from-gray-900 to-black border-accent-main';
            default: return 'bg-white border-gray-200';
        }
    };

    const getTextColors = () => {
        if (variant === 'special') return 'text-white';
        return 'text-gray-900';
    };

    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "relative w-full aspect-[2/3] rounded-2xl p-1 shadow-xl cursor-pointer overflow-hidden",
                getVariantStyles(),
                className
            )}
            onClick={onClick}
        >
            {/* Inner Card Frame */}
            <div className="relative w-full h-full bg-surface-elevated/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10">

                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[url('/static/branding/logo-circle.png')] bg-repeat bg-[length:50px_50px] mix-blend-overlay" />

                {/* Top Info */}
                <div className={cn("absolute top-4 left-4 z-10 flex flex-col font-black leading-none", getTextColors())}>
                    <span className="text-3xl">{overallRating}</span>
                    <span className="text-sm uppercase opacity-80">{position}</span>
                </div>

                {/* Player Image / Placeholder */}
                <div className="absolute inset-x-4 top-12 bottom-1/3 z-0">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={name}
                            className="w-full h-full object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl font-black opacity-10">
                            {number}
                        </div>
                    )}
                </div>

                {/* Bottom Stats Section */}
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/90 to-transparent p-4 flex flex-col justify-end">
                    <div className="mb-2">
                        <h3 className="text-white font-black text-lg truncate leading-tight">{name}</h3>
                        <div className="w-8 h-1 bg-accent-main rounded-full mt-1" />
                    </div>

                    <div className="grid grid-cols-3 gap-x-2 gap-y-1">
                        {stats.slice(0, 6).map((stat, i) => (
                            <div key={i} className="flex items-center justify-between text-[10px] text-white/80">
                                <span className="font-black text-white">{stat.value}</span>
                                <span className="uppercase tracking-wider opacity-60 ml-1">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none mix-blend-overlay" />
        </motion.div>
    );
};
