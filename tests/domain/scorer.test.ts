import { describe, expect, it } from 'vitest';
import {
  computeLoad,
  nextAction,
  rank,
  score,
  type Candidate,
  type Context,
} from '../../src/domain/scorer';

const ctx = (over: Partial<Context> = {}): Context => ({
  now: 1_700_000_000_000,
  load: 0,
  energy: 3,
  minutesFree: null,
  declared: null,
  ...over,
});

const c = (over: Partial<Candidate> = {}): Candidate => ({
  id: 'x',
  title: 'thing',
  system: 'quest',
  effort: 'medium',
  ...over,
});

describe('scorer — cross-system ranking (Principle II)', () => {
  it('lets a drifting person outrank a low-urgency task', () => {
    const task = c({ id: 'q1', title: 'dishes', system: 'quest' });
    const friend = c({
      id: 'p1',
      title: 'message your brother',
      system: 'bond',
      effort: 'low',
      overdue: 3, // ~3x past cadence
    });
    const top = nextAction([task, friend], ctx());
    expect(top?.candidate.id).toBe('p1');
  });

  it('being physically at a place is the strongest single signal', () => {
    const here = c({ id: 'a', atPlace: true });
    const urgent = c({ id: 'b', overdue: 1 });
    expect(nextAction([urgent, here], ctx())?.candidate.id).toBe('a');
  });

  it('is deterministic — equal scores break ties by id, never randomly', () => {
    const a = c({ id: 'aaa' });
    const b = c({ id: 'bbb' });
    const first = rank([b, a], ctx()).map((s) => s.candidate.id);
    const second = rank([a, b], ctx()).map((s) => s.candidate.id);
    expect(first).toEqual(second);
  });
});

describe('scorer — load damping is the safety valve (FR-4.5)', () => {
  it('damps effort rather than applying a flat penalty', () => {
    const low = c({ id: 'l', effort: 'low' });
    const high = c({ id: 'h', effort: 'high' });
    const calm = rank([low, high], ctx({ load: 0 }));
    const loaded = rank([low, high], ctx({ load: 90 }));
    const gapCalm = calm[0].score - calm[1].score;
    const gapLoaded = loaded[0].score - loaded[1].score;
    // High effort must lose MORE ground as load rises.
    expect(gapLoaded).toBeGreaterThan(gapCalm);
  });

  it('offers a regulation candidate at maximum load', () => {
    const work = c({ id: 'w', effort: 'high' });
    const reset = c({ id: 'r', effort: 'low', isRegulation: true });
    expect(nextAction([work, reset], ctx({ load: 95 }))?.candidate.id).toBe('r');
  });

  it('declared overstimulation collapses the field to regulation only', () => {
    const work = c({ id: 'w' });
    const reset = c({ id: 'r', isRegulation: true });
    const out = rank([work, reset], ctx({ declared: 'overstimulated' }));
    expect(out).toHaveLength(1);
    expect(out[0].candidate.id).toBe('r');
  });

  it('wind-down removes high-effort candidates', () => {
    const hard = c({ id: 'h', effort: 'high' });
    const easy = c({ id: 'e', effort: 'low' });
    const out = rank([hard, easy], ctx({ declared: 'wind_down' }));
    expect(out.map((s) => s.candidate.id)).toEqual(['e']);
  });
});

describe('scorer — avoidance demotes, never nags harder (FR-2.3)', () => {
  it('demotes something deferred five or more times', () => {
    const fresh = c({ id: 'f' });
    const avoided = c({ id: 'a', deferCount: 6 });
    const out = rank([avoided, fresh], ctx());
    expect(out[0].candidate.id).toBe('f');
    expect(out[1].why).toContain('cutting up');
  });
});

describe('scorer — purity (Principle IX)', () => {
  it('takes time as input and never reads the clock', () => {
    const cand = [c({ id: 'a', overdue: 1 })];
    const t1 = rank(cand, ctx({ now: 0 }));
    const t2 = rank(cand, ctx({ now: 9_999_999_999 }));
    expect(t1[0].score).toBe(t2[0].score);
  });

  it('returns null rather than inventing something to do', () => {
    expect(nextAction([], ctx())).toBeNull();
  });
});

describe('computeLoad', () => {
  it('is bounded to 0..100', () => {
    const huge = computeLoad({
      overstimDeclarationsLast7d: 99,
      hoursSinceLastBreak: 99,
      socialInteractionsLast2d: 99,
      sleepDebtHours: 99,
    });
    expect(huge).toBe(100);
    const none = computeLoad({
      overstimDeclarationsLast7d: 0,
      hoursSinceLastBreak: 0,
      socialInteractionsLast2d: 0,
      sleepDebtHours: 0,
    });
    expect(none).toBe(0);
  });

  it('rises monotonically with each input', () => {
    const base = { overstimDeclarationsLast7d: 0, hoursSinceLastBreak: 2, socialInteractionsLast2d: 0, sleepDebtHours: 0 };
    expect(computeLoad({ ...base, sleepDebtHours: 3 })).toBeGreaterThan(computeLoad(base));
    expect(computeLoad({ ...base, overstimDeclarationsLast7d: 2 })).toBeGreaterThan(computeLoad(base));
  });
});

describe('score() never rewards inactivity or punishes absence', () => {
  it('has no input representing time-since-last-open', () => {
    // Guard against a future edit adding an absence penalty. The Context type
    // deliberately has no such field; this fails loudly if one appears.
    const keys = Object.keys(ctx());
    expect(keys).not.toContain('daysSinceLastOpen');
    expect(keys).not.toContain('streak');
    expect(keys).not.toContain('missed');
  });

  it('scores identically regardless of how long the app went unused', () => {
    const cand = [c({ id: 'a' })];
    expect(score(cand[0], ctx({ now: 1 })).score).toBe(score(cand[0], ctx({ now: 1e12 })).score);
  });
});
