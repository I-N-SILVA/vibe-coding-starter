export function convocationEmail({
    playerName,
    status,
    matchDate,
    opponent,
    venue,
    matchUrl,
}: {
    playerName: string;
    status: string;
    matchDate: string;
    opponent: string;
    venue: string | null;
    matchUrl: string;
}): { subject: string; html: string } {
    const statusConfig = {
        starting: {
            emoji: '🟢',
            label: 'STARTING XI',
            color: '#22c55e',
            message: "You're in the starting lineup! Get ready to play.",
        },
        bench: {
            emoji: '🟡',
            label: 'ON THE BENCH',
            color: '#f59e0b',
            message: "You're on the bench. Stay ready — your moment may come.",
        },
        not_called: {
            emoji: '🔴',
            label: 'NOT CALLED UP',
            color: '#ef4444',
            message: "You haven't been selected for this match. Keep working hard.",
        },
    }[status] ?? {
        emoji: '⚪',
        label: 'SQUAD ANNOUNCED',
        color: '#6b7280',
        message: 'The squad has been announced for your next match.',
    };

    return {
        subject: `${statusConfig.emoji} Squad announced — ${opponent}`,
        html: `
<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb">
  <div style="background:#0a0a0a;padding:32px 24px;text-align:center">
    <div style="font-size:48px;margin-bottom:8px">${statusConfig.emoji}</div>
    <div style="color:#fff;font-size:22px;font-weight:900;letter-spacing:0.1em;text-transform:uppercase">${statusConfig.label}</div>
  </div>
  <div style="padding:24px">
    <p style="margin:0 0 16px;font-size:16px;color:#111">Hi ${playerName},</p>
    <p style="margin:0 0 24px;font-size:15px;color:#374151">${statusConfig.message}</p>
    <div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:24px">
      <div style="font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;margin-bottom:12px">Match Details</div>
      <div style="font-size:15px;font-weight:700;color:#111;margin-bottom:4px">vs ${opponent}</div>
      <div style="font-size:13px;color:#6b7280">${matchDate}</div>
      ${venue ? `<div style="font-size:13px;color:#6b7280;margin-top:4px">📍 ${venue}</div>` : ''}
    </div>
    <a href="${matchUrl}" style="display:block;background:#f97316;color:#fff;text-align:center;padding:14px 24px;border-radius:10px;font-weight:900;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none">View Match Details</a>
  </div>
  <div style="padding:16px 24px;background:#f9fafb;text-align:center;font-size:11px;color:#9ca3af">PLYAZ — Football League Management</div>
</div>`,
    };
}

export function matchResultEmail({
    teamName,
    opponent,
    homeScore,
    awayScore,
    isHome,
    topEvents,
    matchUrl,
}: {
    teamName: string;
    opponent: string;
    homeScore: number;
    awayScore: number;
    isHome: boolean;
    topEvents: Array<{ type: string; playerName: string | null; minute: number | null }>;
    matchUrl: string;
}): { subject: string; html: string } {
    const teamScore = isHome ? homeScore : awayScore;
    const oppScore = isHome ? awayScore : homeScore;
    const result = teamScore > oppScore ? 'WIN' : teamScore < oppScore ? 'LOSS' : 'DRAW';
    const resultColor = result === 'WIN' ? '#22c55e' : result === 'LOSS' ? '#ef4444' : '#f59e0b';
    const resultEmoji = result === 'WIN' ? '🏆' : result === 'LOSS' ? '😤' : '🤝';

    const eventLines = topEvents
        .slice(0, 5)
        .map((e) => {
            const icon =
                e.type === 'goal'
                    ? '⚽'
                    : e.type === 'yellow_card'
                      ? '🟨'
                      : e.type === 'red_card'
                        ? '🟥'
                        : '↔️';
            return `<div style="font-size:13px;color:#374151;padding:4px 0">${icon} ${e.minute ? e.minute + "'" : ''} ${e.playerName ?? 'Unknown'}</div>`;
        })
        .join('');

    return {
        subject: `${resultEmoji} ${result}: ${teamName} ${teamScore}–${oppScore} ${opponent}`,
        html: `
<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb">
  <div style="background:#0a0a0a;padding:32px 24px;text-align:center">
    <div style="color:#fff;font-size:14px;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;margin-bottom:12px">Full Time</div>
    <div style="color:#fff;font-size:48px;font-weight:900;letter-spacing:0.05em">${teamScore} – ${oppScore}</div>
    <div style="color:#9ca3af;font-size:13px;margin-top:8px">${teamName} vs ${opponent}</div>
  </div>
  <div style="padding:24px">
    <div style="text-align:center;margin-bottom:24px">
      <span style="display:inline-block;background:${resultColor};color:#fff;padding:6px 20px;border-radius:999px;font-size:12px;font-weight:900;letter-spacing:0.15em;text-transform:uppercase">${resultEmoji} ${result}</span>
    </div>
    ${
        topEvents.length > 0
            ? `
    <div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:24px">
      <div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;margin-bottom:10px">Match Events</div>
      ${eventLines}
    </div>`
            : ''
    }
    <a href="${matchUrl}" style="display:block;background:#f97316;color:#fff;text-align:center;padding:14px 24px;border-radius:10px;font-weight:900;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none">View Full Report</a>
  </div>
  <div style="padding:16px 24px;background:#f9fafb;text-align:center;font-size:11px;color:#9ca3af">PLYAZ — Football League Management</div>
</div>`,
    };
}
