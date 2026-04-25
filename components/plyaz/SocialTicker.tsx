'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface TickerEvent {
    id: string;
    text: string;
    type: 'goal' | 'card' | 'info';
}

interface SocialTickerProps {
    events: TickerEvent[];
}

export function SocialTicker({ events }: SocialTickerProps) {
    if (events.length === 0) return null;

    // Duplicate events to ensure seamless looping
    const displayEvents = [...events, ...events, ...events];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] h-12 bg-black border-t border-primary/20 backdrop-blur-xl overflow-hidden flex items-center">
            <div className="flex items-center px-4 bg-primary h-full z-10 shadow-[10px_0_20px_rgba(0,0,0,0.5)]">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white whitespace-nowrap">
                    LIVE TICKER
                </span>
            </div>
            
            <motion.div 
                className="flex items-center gap-12 pl-12"
                animate={{ x: [0, -1000] }}
                transition={{ 
                    duration: 30, 
                    repeat: Infinity, 
                    ease: "linear" 
                }}
            >
                {displayEvents.map((event, i) => (
                    <div key={`${event.id}-${i}`} className="flex items-center gap-3 whitespace-nowrap">
                        <span className="text-primary font-bold">●</span>
                        <span className="text-[11px] font-black text-white/90 uppercase tracking-widest italic">
                            {event.text}
                        </span>
                        {event.type === 'goal' && <span className="text-xl">⚽</span>}
                        {event.type === 'card' && <span className="text-xl">🟨</span>}
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
