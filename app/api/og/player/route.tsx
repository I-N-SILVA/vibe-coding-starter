import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const name = searchParams.get('name') || 'Player';
        const position = searchParams.get('position') || 'FW';
        const jersey = searchParams.get('jersey') || '–';
        const team = searchParams.get('team') || 'PLYAZ FC';
        const rating = searchParams.get('rating') || '80';
        const goals = searchParams.get('goals') || '0';
        const assists = searchParams.get('assists') || '0';
        const games = searchParams.get('games') || '0';
        const nationality = searchParams.get('nationality') || '';
        const teamColor = searchParams.get('teamColor') || '#FF4D00';

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        backgroundColor: '#000',
                        fontFamily: 'sans-serif',
                        position: 'relative',
                    }}
                >
                    {/* Left panel — card */}
                    <div
                        style={{
                            width: '420px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: `linear-gradient(135deg, ${teamColor}22 0%, #111 60%, #000 100%)`,
                            borderRight: '1px solid rgba(255,255,255,0.06)',
                            padding: '60px 40px',
                            position: 'relative',
                        }}
                    >
                        {/* Glow */}
                        <div
                            style={{
                                position: 'absolute',
                                top: '80px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '200px',
                                height: '200px',
                                borderRadius: '50%',
                                background: teamColor,
                                opacity: 0.12,
                                filter: 'blur(60px)',
                            }}
                        />

                        {/* Rating */}
                        <div
                            style={{
                                fontSize: '80px',
                                fontWeight: '900',
                                color: '#FF4D00',
                                lineHeight: 1,
                                marginBottom: '8px',
                            }}
                        >
                            {rating}
                        </div>
                        <div
                            style={{
                                fontSize: '14px',
                                fontWeight: '700',
                                color: 'rgba(255,255,255,0.4)',
                                letterSpacing: '0.25em',
                                textTransform: 'uppercase',
                                marginBottom: '32px',
                            }}
                        >
                            Overall
                        </div>

                        {/* Jersey circle */}
                        <div
                            style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #1a1a1a, #333)',
                                border: `4px solid ${teamColor}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '44px',
                                fontWeight: '900',
                                color: '#fff',
                                marginBottom: '24px',
                            }}
                        >
                            #{jersey}
                        </div>

                        {/* Position badge */}
                        <div
                            style={{
                                padding: '8px 24px',
                                backgroundColor: teamColor,
                                borderRadius: '40px',
                                fontSize: '20px',
                                fontWeight: '900',
                                color: '#fff',
                                letterSpacing: '0.2em',
                                textTransform: 'uppercase',
                            }}
                        >
                            {position}
                        </div>
                    </div>

                    {/* Right panel — info */}
                    <div
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            padding: '60px 72px',
                            background: 'linear-gradient(135deg, #0a0a0a 0%, #000 100%)',
                        }}
                    >
                        {/* Nationality + team */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '16px',
                            }}
                        >
                            {nationality && (
                                <span
                                    style={{
                                        fontSize: '18px',
                                        fontWeight: '700',
                                        color: '#FF4D00',
                                        letterSpacing: '0.1em',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    {nationality}
                                </span>
                            )}
                            {nationality && (
                                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '18px' }}>
                                    •
                                </span>
                            )}
                            <span
                                style={{
                                    fontSize: '18px',
                                    fontWeight: '700',
                                    color: 'rgba(255,255,255,0.4)',
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                {team}
                            </span>
                        </div>

                        {/* Player name */}
                        <div
                            style={{
                                fontSize: name.length > 16 ? '52px' : '68px',
                                fontWeight: '900',
                                color: '#fff',
                                textTransform: 'uppercase',
                                letterSpacing: '-0.02em',
                                lineHeight: 0.95,
                                marginBottom: '48px',
                            }}
                        >
                            {name}
                        </div>

                        {/* Stats row */}
                        <div
                            style={{
                                display: 'flex',
                                gap: '32px',
                                marginBottom: '56px',
                            }}
                        >
                            {[
                                { label: 'Goals', value: goals },
                                { label: 'Assists', value: assists },
                                { label: 'Games', value: games },
                            ].map((s) => (
                                <div
                                    key={s.label}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: '56px',
                                            fontWeight: '900',
                                            color: '#fff',
                                            lineHeight: 1,
                                        }}
                                    >
                                        {s.value}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: '12px',
                                            fontWeight: '700',
                                            color: 'rgba(255,255,255,0.35)',
                                            letterSpacing: '0.2em',
                                            textTransform: 'uppercase',
                                            marginTop: '4px',
                                        }}
                                    >
                                        {s.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* PLYAZ branding */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                            }}
                        >
                            <div
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '8px',
                                    backgroundColor: '#FF4D00',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '16px',
                                    fontWeight: '900',
                                    color: '#fff',
                                }}
                            >
                                P
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span
                                    style={{
                                        fontSize: '18px',
                                        fontWeight: '900',
                                        color: '#fff',
                                        letterSpacing: '0.1em',
                                    }}
                                >
                                    PLYAZ
                                </span>
                                <span
                                    style={{
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        color: 'rgba(255,255,255,0.3)',
                                        letterSpacing: '0.15em',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    Propelling Talent Forward
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            },
        );
    } catch (e: unknown) {
        console.error('Player OG Image Generation Error:', e);
        return new Response('Failed to generate image', { status: 500 });
    }
}
