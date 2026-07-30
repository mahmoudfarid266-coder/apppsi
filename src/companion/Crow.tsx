import { View } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { usePalette } from '../ui/theme';
import type { CompanionState } from './states.manifest';

/**
 * The crow. Watchful, unsentimental — a crow noticing your patterns reads as
 * intelligence rather than devotion, which is the "shadow teacher" posture.
 *
 * Drawn in --ink and --ink-secondary only. NEVER in --accent or --destructive.
 * There is no sad, sick, or neglected variant, and there never will be.
 */
export function Crow({
  state = 'idle',
  size = 28,
}: {
  state?: CompanionState;
  size?: number;
}) {
  const p = usePalette();
  const h = size * 0.88;

  // The only difference between states is where it is looking. Nothing about
  // its posture may read as dejected.
  const pupilX = state === 'attentive' ? 37 : state === 'acknowledging' ? 35 : 36;

  return (
    <View accessibilityRole="image" accessibilityLabel="Your companion">
      <Svg width={size} height={h} viewBox="0 0 52 46">
        <Ellipse cx="24" cy="27" rx="15" ry="11" fill={p.ink} />
        <Circle cx="34" cy="16" r="8" fill={p.ink} />
        <Path d="M41 15 L50 17 L41 19 Z" fill={p.inkSecondary} />
        <Circle cx={pupilX} cy="14" r="1.7" fill={p.paper} />
        <Path
          d="M12 24 Q4 30 11 34"
          stroke={p.ink}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M20 36 L19 42 M28 36 L29 42"
          stroke={p.inkSecondary}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}
