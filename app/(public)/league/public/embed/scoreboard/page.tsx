'use client';
import React, { useState, useEffect } from 'react';
import type { Match } from '@/lib/supabase/types';

export default function EmbedScoreboard() {
    const [matches, setMatches] = useState<Match[]>([]);

    useEffect(() => {
        async function load() {
            const [live, upcoming] = await Promise.all([
                fetch('/api/league/public/matches?status=live').then((r) => (r.ok ? r.json() : [])),
                fetch('/api/league/public/matches?status=scheduled').then((r) =>
                    r.ok ? r.json() : [],
                ),
            ]);
            setMatches([...(live as Match[]), ...(upcoming as Match[])].slice(0, 10));
        }
        void load();
        const interval = setInterval(() => {
            void load();
        }, 30_000);
        return () => clearInterval(interval);
    }, []);

    if (matches.length === 0) {
        return (
            <div
                style={{
                    fontFamily: 'system-ui,sans-serif',
                    padding: '16px',
                    textAlign: 'center',
                    color: '#6b7280',
                    fontSize: '13px',
                }}
            >
                No live matches
            </div>
        );
    }

    return (
        <div style={{ fontFamily: 'system-ui,sans-serif', background: '#fff' }}>
            {matches.map((m) => (
                <div
                    key={m.id}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 16px',
                        borderBottom: '1px solid #f3f4f6',
                    }}
                >
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#111', flex: 1 }}>
                        {(m.home_team as { name: string } | undefined)?.name ?? '?'}
                    </span>
                    <span
                        style={{
                            fontSize: '15px',
                            fontWeight: 900,
                            color: '#f97316',
                            padding: '0 12px',
                            letterSpacing: '0.05em',
                        }}
                    >
                        {m.status === 'live' || m.status === 'completed'
                            ? `${m.home_score} – ${m.away_score}`
                            : 'vs'}
                    </span>
                    <span
                        style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            color: '#111',
                            flex: 1,
                            textAlign: 'right',
                        }}
                    >
                        {(m.away_team as { name: string } | undefined)?.name ?? '?'}
                    </span>
                    {m.status === 'live' && (
                        <span
                            style={{
                                marginLeft: '8px',
                                background: '#ef4444',
                                color: '#fff',
                                fontSize: '9px',
                                fontWeight: 900,
                                padding: '2px 6px',
                                borderRadius: '999px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                            }}
                        >
                            LIVE
                        </span>
                    )}
                </div>
            ))}
            <div
                style={{
                    padding: '8px 16px',
                    textAlign: 'right',
                    fontSize: '10px',
                    color: '#9ca3af',
                }}
            >
                Powered by PLYAZ
            </div>
        </div>
    );
}
