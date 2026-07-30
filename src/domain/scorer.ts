/**
 * THE CROSS-SYSTEM SCORER — Constitution Principle II.
 *
 * Pure. No React, no I/O, no Date.now() — time is injected so it is exhaustively
 * testable without a simulator (Principle IX).
 *
 * Every system compiles down to Candidate[]. The scorer knows nothing about
 * habits, people, or places specifically; adding an eighth system means emitting
 * candidates, not editing this file.
 *
 * Per-system ranking merged afterwards is PROHIBITED — it reintroduces exactly
 * the choice this exists to remove.
 */

export type SystemName =
  | 'quest'
  | 'rhythm'
  | 'regulation'
  | 'bond'
  | 'solitude'
  | 'record';

export interface Candidate {
  id: string;
  title: string;
  system: SystemName;
  /** Minutes. Unknown is fine — it just cannot win a time-fit bonus. */
  estimateMinutes?: number;
  /** How much the person must bring. Damped hard when load is high. */
  effort: 'low' | 'medium' | 'high';
  /** 0..1 — how overdue relative to its own cadence (Bonds, Rhythms). */
  overdue?: number;
  /** True when the person is physically at/near this candidate's place. */
  atPlace?: boolean;
  /** Times the person has pushed this away. Drives the avoidance penalty. */
  deferCount?: number;
  /** Regulation candidates are the only thing offered at maximum load. */
  isRegulation?: boolean;
}

export interface Context {
  now: number;
  /** 0..100. High load suppresses effort — FR-4.5. */
  load: number;
  /** 1..5 self-reported, or null when unknown. */
  energy: number | null;
  /** Minutes until the next hard commitment, or null. */
  minutesFree: number | null;
  /** Declared state, if any. */
  declared: 'overstimulated' | 'understimulated' | 'wind_down' | null;
}

export interface Scored {
  candidate: Candidate;
  score: number;
  why: string;
}

const EFFORT_COST: Record<Candidate['effort'], number> = { low: 1, medium: 2, high: 3 };

/**
 * Load damps EFFORT, it is not a flat penalty. As load rises, high-effort
 * candidates fall and regulation rises. At maximum load a break outranks
 * everything and nothing else is offered.
 */
export function score(c: Candidate, ctx: Context): Scored {
  const reasons: string[] = [];
  let s = 10;

  // Overdue pressure — Bonds drift and Rhythms cadence share this channel, so a
  // 3-months-overdue friend can outrank a work task. That is the point.
  if (c.overdue && c.overdue > 0) {
    const bump = Math.min(c.overdue, 3) * 14;
    s += bump;
    if (c.overdue >= 1) reasons.push('overdue');
  }

  // Being physically present is the strongest signal the app has.
  if (c.atPlace) {
    s += 30;
    reasons.push("you're here");
  }

  // Time fit — only when both numbers are known.
  if (c.estimateMinutes != null && ctx.minutesFree != null) {
    if (c.estimateMinutes <= ctx.minutesFree) {
      s += 8;
      reasons.push('fits');
    } else {
      s -= 12;
    }
  }

  // Energy match. Low energy makes high effort worse, not forbidden.
  if (ctx.energy != null) {
    const gap = EFFORT_COST[c.effort] - Math.ceil(ctx.energy / 2);
    if (gap > 0) s -= gap * 6;
    else if (gap < 0) s += 3;
  }

  // Load damping — multiplies effort cost. This is the safety valve.
  const damp = (ctx.load / 100) * EFFORT_COST[c.effort] * 18;
  s -= damp;
  if (ctx.load >= 70 && c.effort !== 'low') reasons.push('heavy for right now');

  // Regulation rises as load rises.
  if (c.isRegulation) {
    s += (ctx.load / 100) * 55;
    if (ctx.load >= 50) reasons.push('this would help');
  }

  // Avoidance: something pushed away repeatedly is DEMOTED, not shoved harder.
  // It should be offered for breaking down instead (FR-2.3).
  const d = c.deferCount ?? 0;
  if (d >= 5) {
    s -= 40;
    reasons.push('needs cutting up');
  } else if (d > 0) {
    s -= d * 3;
  }

  return { candidate: c, score: s, why: reasons[0] ?? '' };
}

/**
 * Rank everything from every system into ONE ordering.
 *
 * Declared overstimulation collapses the field to regulation only — the app
 * stops asking for anything else until the person exits (FR-4.3).
 */
export function rank(candidates: Candidate[], ctx: Context): Scored[] {
  let pool = candidates;

  if (ctx.declared === 'overstimulated' || ctx.load >= 90) {
    const reg = pool.filter((c) => c.isRegulation);
    if (reg.length > 0) pool = reg;
  }

  if (ctx.declared === 'wind_down') {
    pool = pool.filter((c) => c.effort !== 'high');
  }

  return pool
    .map((c) => score(c, ctx))
    .sort((a, b) => b.score - a.score || a.candidate.id.localeCompare(b.candidate.id));
}

/** The one card. Null means genuinely nothing needs them — say so as sufficiency. */
export function nextAction(candidates: Candidate[], ctx: Context): Scored | null {
  return rank(candidates, ctx)[0] ?? null;
}

/**
 * Allostatic load, 0..100. Computed, never stored (Principle IX, FR-4.5).
 * Rises with overstim declarations, missed breaks, and social intensity;
 * falls with rest.
 */
export function computeLoad(input: {
  overstimDeclarationsLast7d: number;
  hoursSinceLastBreak: number;
  socialInteractionsLast2d: number;
  sleepDebtHours: number;
}): number {
  const l =
    input.overstimDeclarationsLast7d * 12 +
    Math.max(0, input.hoursSinceLastBreak - 2) * 6 +
    input.socialInteractionsLast2d * 4 +
    Math.max(0, input.sleepDebtHours) * 7;
  return Math.max(0, Math.min(100, Math.round(l)));
}
