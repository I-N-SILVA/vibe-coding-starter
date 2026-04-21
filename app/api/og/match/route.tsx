import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        // Match Details
        const home = searchParams.get('home') || 'Home Team';
        const away = searchParams.get('away') || 'Away Team';
        const homeScore = searchParams.get('homeScore') || '0';
        const awayScore = searchParams.get('awayScore') || '0';
        const competition = searchParams.get('competition') || 'PLYAZ LEAGUE';
        const status = searchParams.get('status') || 'FULL TIME';

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#000',
                        backgroundImage: 'radial-gradient(circle at top right, #333, #000)',
                        padding: '60px',
                        fontFamily: 'sans-serif',
                    }}
                >
                    {/* Header */}
                    <div style={{ display: 'flex', marginBottom: '40px' }}>
                        <div style={{ 
                            padding: '8px 20px', 
                            backgroundColor: '#FF5C1A', 
                            borderRadius: '40px',
                            color: '#fff',
                            fontSize: '24px',
                            fontWeight: '900',
                            textTransform: 'uppercase',
                            letterSpacing: '0.2em'
                        }}>
                            {competition}
                        </div>
                    </div>

                    {/* Main Scoreboard */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <span style={{ color: '#fff', fontSize: '64px', fontWeight: '900', textAlign: 'right', textTransform: 'uppercase' }}>{home}</span>
                        </div>
                        
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            backgroundColor: '#fff',
                            padding: '20px 40px',
                            borderRadius: '30px',
                            margin: '0 40px',
                            minWidth: '240px'
                        }}>
                            <span style={{ color: '#000', fontSize: '100px', fontWeight: '900' }}>{homeScore}</span>
                            <span style={{ color: '#FF5C1A', fontSize: '100px', fontWeight: '900', margin: '0 20px' }}>:</span>
                            <span style={{ color: '#000', fontSize: '100px', fontWeight: '900' }}>{awayScore}</span>
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <span style={{ color: '#fff', fontSize: '64px', fontWeight: '900', textAlign: 'left', textTransform: 'uppercase' }}>{away}</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', marginTop: '60px', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ color: '#FF5C1A', fontSize: '32px', fontWeight: '900', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                            {status}
                        </span>
                        <div style={{ display: 'flex', marginTop: '20px', opacity: 0.4 }}>
                            <span style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', letterSpacing: '0.1em' }}>PLYAZ.CO.UK • PROPELLING TALENT FORWARD</span>
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (e: any) {
        return new Response(`Failed to generate image`, { status: 500 });
    }
}
