import { Platform } from 'react-native';
import type { SizeClass } from './theme';

/**
 * Type scale — design-system/MASTER.md §2 and §3b.
 *
 * The display face is bundled Space Grotesk and is used at >=24pt ONLY. Every
 * size a person can scale up with Dynamic Type uses the system face, because
 * custom fonts are the most common cause of clipping at accessibility sizes
 * (Principle VII, FR-036).
 *
 * Until the font file is added to assets/fonts, DISPLAY_FAMILY falls back to
 * the system face — the layout is correct, the character is not.
 */
export const DISPLAY_FAMILY = Platform.select({
  ios: 'SpaceGrotesk-Bold',
  default: 'System',
});

/** Hero does NOT scale linearly with width — the content column gives it presence. */
const HERO: Record<SizeClass, number> = {
  compact: 36,
  narrow: 36,
  medium: 44,
  wide: 52,
  widest: 52,
};

const FIELD: Record<SizeClass, number> = {
  compact: 20,
  narrow: 20,
  medium: 22,
  wide: 24,
  widest: 24,
};

export function hero(size: SizeClass) {
  return {
    fontFamily: DISPLAY_FAMILY,
    fontSize: HERO[size],
    lineHeight: Math.round(HERO[size] * 1.0),
    letterSpacing: -HERO[size] * 0.025,
    fontWeight: '700' as const,
  };
}

export function fieldInput(size: SizeClass) {
  return { fontSize: FIELD[size], lineHeight: Math.round(FIELD[size] * 1.3) };
}

/** System face below 24pt. Scales with Dynamic Type. */
export const body = { fontSize: 17, lineHeight: 26 } as const;
export const emphasis = { fontSize: 17, lineHeight: 25, fontWeight: '600' as const } as const;
export const supporting = { fontSize: 15, lineHeight: 23 } as const;
export const meta = { fontSize: 13, lineHeight: 18 } as const;

/** Timers, counts, XP — prevents width jitter. */
export const tabular = { fontVariant: ['tabular-nums' as const] };
