import type { ReactNode } from 'react';
import { MotiView } from 'moti';
import { Pressable, type ViewStyle } from 'react-native';
import { useMotion } from './theme';

/**
 * The whole motion vocabulary, per the design handoff.
 *
 *   micro 150ms  ·  enter 200ms  ·  exit 120ms
 *   transform and opacity ONLY — never width, height, or layout position
 *   press feedback is opacity 0.7, never a scale that shifts layout
 *   one or two elements in motion per view, maximum
 *
 * Reduce Motion resolves every duration to 0ms. Not "reduced" — zero. That is
 * constitutional (Principle VII) and `useMotion` enforces it centrally, so no
 * component needs to remember.
 *
 * Decorative motion is a defect in this product. Every animation below exists
 * to express a cause and effect.
 */

/** Content appearing: 200ms, opacity + 8pt rise. The standard enter. */
export function Enter({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode;
  delay?: number;
  style?: ViewStyle;
}) {
  const m = useMotion();
  return (
    <MotiView
      style={style}
      from={{ opacity: 0, translateY: m.reduced ? 0 : 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: m.enter, delay: m.reduced ? 0 : delay }}
    >
      {children}
    </MotiView>
  );
}

/**
 * A card being replaced by the next one — the Now screen's core interaction.
 * Keyed remount so each offer enters cleanly rather than cross-fading in place.
 */
export function Swap({ swapKey, children }: { swapKey: string; children: ReactNode }) {
  const m = useMotion();
  return (
    <MotiView
      key={swapKey}
      from={{ opacity: 0, translateY: m.reduced ? 0 : 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: m.enter }}
    >
      {children}
    </MotiView>
  );
}

/** Expanding a row — height and opacity, one at a time. */
export function Expand({ open, children }: { open: boolean; children: ReactNode }) {
  const m = useMotion();
  if (!open) return null;
  return (
    <MotiView
      from={{ opacity: 0, translateY: m.reduced ? 0 : -4 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: m.enter }}
    >
      {children}
    </MotiView>
  );
}

/**
 * Press feedback: opacity 0.7 for 150ms. No scale, no shadow change, no
 * transform that shifts surrounding layout.
 */
export function Press({
  children,
  onPress,
  onLongPress,
  delayLongPress,
  style,
  accessibilityLabel,
  accessibilityHint,
}: {
  children: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  delayLongPress?: number;
  style?: ViewStyle | ((p: { pressed: boolean }) => ViewStyle);
  accessibilityLabel?: string;
  accessibilityHint?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={delayLongPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [
        typeof style === 'function' ? style({ pressed }) : style,
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      {children}
    </Pressable>
  );
}

/** A track that fills. It never animates backwards. */
export function FillTrack({
  pct,
  height = 10,
  track,
  fill,
}: {
  pct: number;
  height?: number;
  track: string;
  fill: string;
}) {
  const m = useMotion();
  return (
    <MotiView style={{ height, backgroundColor: track, borderRadius: 999, overflow: 'hidden' }}>
      <MotiView
        from={{ width: '0%' }}
        animate={{ width: `${Math.max(0, Math.min(1, pct)) * 100}%` }}
        transition={{ type: 'timing', duration: m.enter }}
        style={{ height, backgroundColor: fill, borderRadius: 999 }}
      />
    </MotiView>
  );
}
