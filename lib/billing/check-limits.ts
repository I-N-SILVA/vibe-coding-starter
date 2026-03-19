import { PLAN_LIMITS, Plan } from './config';

export async function checkPlanLimit(
  plan: Plan,
  resource: 'competitions' | 'teams' | 'players',
  currentCount: number
): Promise<{ allowed: boolean; limit: number; message?: string }> {
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
  const keyMap: Record<string, keyof typeof limits> = {
    competitions: 'maxCompetitions',
    teams: 'maxTeams',
    players: 'maxPlayers',
  };
  
  const key = keyMap[resource];
  const limit = limits[key] as number;

  if (currentCount >= limit) {
    return {
      allowed: false,
      limit,
      message: `Your ${plan} plan allows ${limit === Infinity ? 'unlimited' : limit} ${resource}. Upgrade to create more.`,
    };
  }
  return { allowed: true, limit };
}

export function canFeature(plan: Plan, feature: keyof typeof PLAN_LIMITS.pro): boolean {
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
  return !!limits[feature];
}
