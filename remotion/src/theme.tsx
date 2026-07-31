import { loadFont } from '@remotion/google-fonts/SpaceGrotesk';

// Without this the hero falls back to a system face and the display type is
// simply wrong — the first render made that obvious.
const { fontFamily: SPACE_GROTESK } = loadFont('normal', { weights: ['500', '700'] });

/**
 * Palette A, lifted verbatim from src/ui/tokens.ts in the app.
 *
 * These MUST stay in sync with the app. If a token changes there, change it
 * here — the promo video showing a colour the app does not use is worse than
 * no promo video.
 */
export const light = {
  paper: '#FDF4EC',
  surface: '#FFFFFF',
  sunken: '#F9DBBD',
  ink: '#450920',
  inkSecondary: '#6E4A52',
  inkMuted: '#8A6069',
  rule: '#EEDCD3',
  onInk: '#FDF4EC',
  accent: '#A53860',
  onAccent: '#FFFFFF',
} as const;

export const dark = {
  paper: '#24050F',
  surface: '#300714',
  sunken: '#1A040B',
  ink: '#F9DBBD',
  inkSecondary: '#D3AE99',
  inkMuted: '#A08578',
  rule: '#43121F',
  onInk: '#24050F',
  accent: '#FFA5AB',
  onAccent: '#24050F',
} as const;

export type Palette = typeof light;

export const DISPLAY = `${SPACE_GROTESK}, system-ui, sans-serif`;
export const SYSTEM =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif";

/** The crow, same three paths as the app. */
export function Crow({
  size = 120,
  ink,
  inkSecondary,
  paper,
  tilt = 0,
}: {
  size?: number;
  ink: string;
  inkSecondary: string;
  paper: string;
  tilt?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <path
        d="M64 14c-11 0-19 9-19 20v3l-15 6C19 47 12 57 12 68c0 11 9 19 21 19h27l26 4-16-14c8-7 12-17 10-28l-2-13C77 23 74 14 64 14Z"
        fill={ink}
      />
      <path d="M45 27 20 32l25 9Z" fill={inkSecondary} />
      <circle cx="60" cy="31" r="3.4" fill={paper} />
    </svg>
  );
}
