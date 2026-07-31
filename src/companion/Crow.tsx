import { MotiView } from 'moti';
import Svg, { Circle, Path } from 'react-native-svg';
import { usePalette, useMotion } from '../ui/theme';
import type { CompanionState } from './states.manifest';

/**
 * The crow. SVG lifted directly from the design handoff (viewBox 0 0 100 100,
 * three paths: body, beak, eye).
 *
 * Exactly three states, differing only in tilt and where the eye sits:
 *   idle          upright, eye at rest
 *   attentive     -5deg, eye forward   (person is typing)
 *   acknowledging +4deg, eye raised    (a capture landed)
 *
 * There is NO fourth state. No sad, sleeping, hungry, or dusty variant exists —
 * not as an unused asset, not behind a flag (FR-021). Drawn in ink and
 * inkSecondary only, never accent, never destructive.
 *
 * State derives from input focus and save events ONLY — never from elapsed
 * time, streak, or inactivity (FR-020).
 */

const TILT: Record<CompanionState, number> = {
  idle: 0,
  attentive: -5,
  acknowledging: 4,
};

const EYE_Y: Record<CompanionState, number> = {
  idle: 31,
  attentive: 30,
  acknowledging: 29.5,
};

export function Crow({
  state = 'idle',
  size = 34,
}: {
  state?: CompanionState;
  size?: number;
}) {
  const p = usePalette();
  const motion = useMotion();

  return (
    <MotiView
      accessibilityRole="image"
      accessibilityLabel="Your companion"
      animate={{ rotate: `${TILT[state]}deg` }}
      transition={{ type: 'timing', duration: motion.micro }}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Path
          d="M64 14c-11 0-19 9-19 20v3l-15 6C19 47 12 57 12 68c0 11 9 19 21 19h27l26 4-16-14c8-7 12-17 10-28l-2-13C77 23 74 14 64 14Z"
          fill={p.ink}
        />
        <Path d="M45 27 20 32l25 9Z" fill={p.inkSecondary} />
        <Circle cx={60} cy={EYE_Y[state]} r={3.4} fill={p.paper} />
      </Svg>
    </MotiView>
  );
}
