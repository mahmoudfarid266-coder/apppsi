/**
 * Design tokens — design-system/MASTER.md §1 (palette A).
 *
 * Every ratio in the comments was measured, not estimated.
 *
 * TWO RULES THAT WILL CAUSE BUGS IF FORGOTTEN:
 *
 *  1. `accent` SWAPS SWATCH between themes. It is not a tint adjustment.
 *     Light uses berry #A53860 (5.80:1). Dark uses cotton-candy #FFA5AB (10.17:1).
 *     Each FAILS in the other's mode — berry is 3.02:1 on dark, cotton-candy is
 *     1.72:1 on light. Never reuse one across both.
 *
 *  2. `destructive` may appear ONLY in a permanent-deletion confirm dialog, and
 *     only as an outline, never a fill. Constitution Principle IV.
 */

export type ThemeName = 'light' | 'dark';

export interface Palette {
  paper: string;
  surface: string;
  sunken: string;
  ink: string;
  inkSecondary: string;
  inkMuted: string;
  rule: string;
  onInk: string;
  accent: string;
  onAccent: string;
  accentTint: string;
  focusRing: string;
  /** Destructive-confirm dialogs only. Outlined, never filled. */
  destructive: string;
}

export const light: Palette = {
  paper: '#FDF4EC',
  surface: '#FFFFFF',
  sunken: '#F9DBBD',
  ink: '#450920', //  14.72:1 on paper — AAA
  inkSecondary: '#6E4A52', //   6.99:1 — AA
  inkMuted: '#8A6069', //   4.88:1 — AA floor, nothing below this
  rule: '#EEDCD3', // decorative dividers only; no ratio requirement
  onInk: '#FDF4EC',
  accent: '#A53860', //   5.80:1 — berry-crush
  onAccent: '#FFFFFF', //   6.30:1 on accent
  accentTint: '#FFA5AB', // FILL ONLY in light — 1.72:1 as text, never text here
  focusRing: '#450920',
  destructive: '#9D0208', //   7.90:1 — AAA
};

export const dark: Palette = {
  paper: '#24050F',
  surface: '#300714',
  sunken: '#1A040B',
  ink: '#F9DBBD', //  14.40:1 on paper — AAA
  inkSecondary: '#D3AE99', //   9.32:1 — AAA
  inkMuted: '#A08578', //   5.55:1 — AA floor
  rule: '#43121F',
  onInk: '#24050F',
  accent: '#FFA5AB', //  10.17:1 — cotton-candy. SWAPPED from berry.
  onAccent: '#24050F',
  accentTint: '#DA627D', //   5.46:1 — blush, second accent weight
  focusRing: '#F9DBBD',
  destructive: '#E5736B', //   6.34:1 — AA
};

export const palettes: Record<ThemeName, Palette> = { light, dark };

/** Spacious scale — design-system §3. */
export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 24,
  6: 32,
  7: 48,
  8: 72,
  9: 112,
} as const;

export const radius = {
  field: 14,
  card: 18,
  pill: 999,
} as const;

/** Every duration resolves to 0 when Reduce Motion is on. See useMotion. */
export const duration = {
  instant: 0,
  micro: 150,
  enter: 200,
  exit: 120,
} as const;

/** Minimum touch target. Use hitSlop where the glyph is smaller. */
export const MIN_TARGET = 48;

/** Content never spans full width on a tablet — design-system §3b. */
export const CONTENT_MAX = 620;
