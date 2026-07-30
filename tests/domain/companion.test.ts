import { describe, expect, it } from 'vitest';
import {
  COMPANION_STATES,
  growthStage,
  type CompanionHistory,
} from '../../src/companion/states.manifest';

/**
 * T021 / T102 — the companion state assertion.
 *
 * FR-021 says no depiction of neglect may EXIST, not merely that it must not be
 * reached. So this asserts over the artefact set, not over behaviour. Adding a
 * `sad` state fails the build even if nothing ever renders it.
 */
describe('companion states are a closed set (Principle IV, FR-021)', () => {
  it('is exactly the three permitted states', () => {
    expect([...COMPANION_STATES].sort()).toEqual(['acknowledging', 'attentive', 'idle']);
  });

  it('contains no state conveying neglect, illness, or disappointment', () => {
    const FORBIDDEN = [
      'sad', 'sick', 'hungry', 'neglected', 'disappointed', 'deteriorated',
      'sleeping', 'dusty', 'waiting', 'lonely', 'dying', 'unhappy', 'wilted',
    ];
    for (const bad of FORBIDDEN) {
      expect(COMPANION_STATES as readonly string[]).not.toContain(bad);
    }
  });
});

describe('growth is monotonic and blind to absence (FR-020)', () => {
  const h = (captureCount: number): CompanionHistory => ({ captureCount });

  it('never decreases as cumulative history grows', () => {
    let prev = growthStage(h(0));
    for (let n = 0; n <= 500; n += 7) {
      const cur = growthStage(h(n));
      expect(cur).toBeGreaterThanOrEqual(prev);
      prev = cur;
    }
  });

  it('accepts no time, now, or last-seen parameter', () => {
    // Inactivity cannot influence growth because the function has no way to
    // observe it. This is FR-020 made mechanical rather than promised.
    expect(growthStage.length).toBe(1);
    const keys = Object.keys(h(1));
    expect(keys).toEqual(['captureCount']);
  });

  it('is identical for the same history regardless of when it is called', () => {
    const a = growthStage(h(42));
    const b = growthStage(h(42));
    expect(a).toBe(b);
  });

  it('treats negative or nonsense input as zero rather than throwing', () => {
    expect(growthStage(h(-10))).toBe(0);
  });
});
