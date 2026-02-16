/**
 * Match State Machine - PLYAZ League Manager
 * Enforces valid match status transitions.
 */

const VALID_TRANSITIONS: Record<string, string[]> = {
  upcoming:   ['live', 'postponed', 'cancelled'],
  live:       ['completed', 'postponed'],
  completed:  [],
  postponed:  ['upcoming', 'cancelled'],
  cancelled:  [],
};

export function canTransition(from: string, to: string): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function validateTransition(from: string, to: string): string | null {
  if (!canTransition(from, to)) {
    return `Invalid match status transition from "${from}" to "${to}"`;
  }
  return null;
}
