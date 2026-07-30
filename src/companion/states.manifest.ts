/**
 * THE COMPANION STATE MANIFEST — a closed union.
 *
 * `tests/components/companion-states.test.ts` asserts this set is EXACTLY the
 * three below. Adding a fourth fails the build even if it is never rendered,
 * because FR-021 says no depiction of neglect may EXIST, not merely that it
 * must not be reached.
 *
 * Permanently forbidden: sad, sick, hungry, neglected, disappointed,
 * deteriorated, sleeping, dusty, waiting, lonely — and any variant conveying
 * that the person's absence or inaction had a cost.
 */
export const COMPANION_STATES = ['idle', 'attentive', 'acknowledging'] as const;

export type CompanionState = (typeof COMPANION_STATES)[number];

/**
 * Growth stage. Pure, and note what is NOT in the signature: no `now`, no
 * `lastSeenAt`, no streak. Inactivity cannot influence growth because this
 * function has no way to observe it. That is FR-020 made mechanical.
 */
export interface CompanionHistory {
  /** Cumulative, never decremented. */
  captureCount: number;
}

export type GrowthStage = 0 | 1 | 2 | 3;

const THRESHOLDS = [0, 10, 50, 200] as const;

export function growthStage(history: CompanionHistory): GrowthStage {
  const n = Math.max(0, history.captureCount);
  let stage: GrowthStage = 0;
  for (let i = THRESHOLDS.length - 1; i >= 0; i--) {
    if (n >= THRESHOLDS[i]) {
      stage = i as GrowthStage;
      break;
    }
  }
  return stage;
}
