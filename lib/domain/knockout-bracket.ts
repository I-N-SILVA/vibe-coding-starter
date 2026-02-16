/**
 * Knockout Bracket Generator - PLYAZ League Manager
 * Creates full bracket structures with seeded matchups and handles
 * winner advancement through rounds.
 */

import type { Team } from '@/types';

// ============================================
// TYPES
// ============================================

export interface BracketMatchup {
  id: string;
  round: number;
  position: number;
  competitionId: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeTeamName: string;
  awayTeamName: string;
  winnerId: string | null;
  nextMatchId: string | null;
  status: 'upcoming' | 'completed' | 'bye';
  homeScore: number;
  awayScore: number;
}

export interface BracketRound {
  round: number;
  name: string;
  matchups: BracketMatchup[];
}

export interface Bracket {
  competitionId: string;
  rounds: BracketRound[];
  totalRounds: number;
}

// ============================================
// HELPERS
// ============================================

/** Returns the next power of 2 >= n. */
function nextPowerOfTwo(n: number): number {
  let power = 1;
  while (power < n) power *= 2;
  return power;
}

/** Human-readable round name based on remaining teams. */
function roundName(totalRounds: number, round: number): string {
  const remaining = totalRounds - round;
  if (remaining === 0) return 'Final';
  if (remaining === 1) return 'Semi-Finals';
  if (remaining === 2) return 'Quarter-Finals';
  return `Round of ${Math.pow(2, remaining + 1)}`;
}

/**
 * Generate seeded pairings for the first round.
 * Uses the standard bracket seeding pattern: 1v16, 8v9, 5v12, 4v13, etc.
 */
function seededOrder(bracketSize: number): number[] {
  if (bracketSize === 1) return [0];
  const half = seededOrder(bracketSize / 2);
  const result: number[] = [];
  for (const seed of half) {
    result.push(seed);
    result.push(bracketSize - 1 - seed);
  }
  return result;
}

// ============================================
// MAIN API
// ============================================

/**
 * Generates a full knockout bracket with all rounds pre-created.
 * Teams are seeded (1v16, 8v9 pattern). Non-power-of-2 team counts
 * receive byes that auto-advance to the next round.
 */
export function generateFullBracket(
  teams: Team[],
  competitionId: string
): Bracket {
  if (teams.length < 2) {
    return { competitionId, rounds: [], totalRounds: 0 };
  }

  const bracketSize = nextPowerOfTwo(teams.length);
  const totalRounds = Math.log2(bracketSize);
  const rounds: BracketRound[] = [];

  // Build a lookup of all matchup IDs so we can set nextMatchId
  const matchIdGrid: string[][] = [];
  for (let r = 0; r < totalRounds; r++) {
    const matchCount = bracketSize / Math.pow(2, r + 1);
    const ids: string[] = [];
    for (let p = 0; p < matchCount; p++) {
      ids.push(`ko-${competitionId}-r${r + 1}-m${p + 1}`);
    }
    matchIdGrid.push(ids);
  }

  // ---- Round 1: seeded matchups with potential byes ----
  const order = seededOrder(bracketSize);
  const round1Matchups: BracketMatchup[] = [];
  const firstRoundCount = bracketSize / 2;

  for (let i = 0; i < firstRoundCount; i++) {
    const seedA = order[i * 2];
    const seedB = order[i * 2 + 1];
    const teamA = seedA < teams.length ? teams[seedA] : null;
    const teamB = seedB < teams.length ? teams[seedB] : null;

    const nextMatchId =
      totalRounds > 1 ? matchIdGrid[1][Math.floor(i / 2)] : null;

    const isBye = !teamA || !teamB;
    const winnerId = isBye ? (teamA?.id ?? teamB?.id ?? null) : null;

    round1Matchups.push({
      id: matchIdGrid[0][i],
      round: 1,
      position: i,
      competitionId,
      homeTeamId: teamA?.id ?? null,
      awayTeamId: teamB?.id ?? null,
      homeTeamName: teamA?.name ?? 'BYE',
      awayTeamName: teamB?.name ?? 'BYE',
      winnerId,
      nextMatchId,
      status: isBye ? 'bye' : 'upcoming',
      homeScore: 0,
      awayScore: 0,
    });
  }

  rounds.push({
    round: 1,
    name: roundName(totalRounds, 0),
    matchups: round1Matchups,
  });

  // ---- Subsequent rounds: TBD placeholders ----
  for (let r = 1; r < totalRounds; r++) {
    const matchCount = bracketSize / Math.pow(2, r + 1);
    const matchups: BracketMatchup[] = [];

    for (let p = 0; p < matchCount; p++) {
      const nextMatchId =
        r + 1 < totalRounds ? matchIdGrid[r + 1][Math.floor(p / 2)] : null;

      matchups.push({
        id: matchIdGrid[r][p],
        round: r + 1,
        position: p,
        competitionId,
        homeTeamId: null,
        awayTeamId: null,
        homeTeamName: 'TBD',
        awayTeamName: 'TBD',
        winnerId: null,
        nextMatchId,
        status: 'upcoming',
        homeScore: 0,
        awayScore: 0,
      });
    }

    rounds.push({
      round: r + 1,
      name: roundName(totalRounds, r),
      matchups,
    });
  }

  // ---- Auto-advance byes into next round ----
  for (const matchup of round1Matchups) {
    if (matchup.status === 'bye' && matchup.winnerId && matchup.nextMatchId) {
      propagateWinner(rounds, matchup.nextMatchId, matchup.winnerId, matchup.homeTeamName !== 'BYE' ? matchup.homeTeamName : matchup.awayTeamName);
    }
  }

  return { competitionId, rounds, totalRounds };
}

/**
 * Advances a winner into the next round's matchup after a match is completed.
 * Returns the updated bracket, or null if the matchId was not found.
 */
export function advanceWinner(
  bracket: Bracket,
  matchId: string,
  winnerId: string,
  winnerName?: string
): Bracket | null {
  let targetMatchup: BracketMatchup | null = null;

  for (const round of bracket.rounds) {
    for (const m of round.matchups) {
      if (m.id === matchId) {
        targetMatchup = m;
        break;
      }
    }
    if (targetMatchup) break;
  }

  if (!targetMatchup) return null;

  targetMatchup.winnerId = winnerId;
  targetMatchup.status = 'completed';

  const resolvedName =
    winnerName ??
    (winnerId === targetMatchup.homeTeamId
      ? targetMatchup.homeTeamName
      : targetMatchup.awayTeamName);

  if (targetMatchup.nextMatchId) {
    propagateWinner(
      bracket.rounds,
      targetMatchup.nextMatchId,
      winnerId,
      resolvedName
    );
  }

  return bracket;
}

/** Place a winner into the correct slot of the next-round matchup. */
function propagateWinner(
  rounds: BracketRound[],
  nextMatchId: string,
  winnerId: string,
  winnerName: string
): void {
  for (const round of rounds) {
    for (const m of round.matchups) {
      if (m.id === nextMatchId) {
        if (!m.homeTeamId) {
          m.homeTeamId = winnerId;
          m.homeTeamName = winnerName;
        } else if (!m.awayTeamId) {
          m.awayTeamId = winnerId;
          m.awayTeamName = winnerName;
        }
        return;
      }
    }
  }
}
