import type { ReactNode } from 'react';
import { Pressable, Text, View, type ViewStyle } from 'react-native';
import { usePalette, useSizeClass } from './theme';
import { CONTENT_MAX, MIN_TARGET, radius, space } from './tokens';
import { emphasis } from './type';

/**
 * The centred content column — the single most important iPad rule.
 * Content NEVER spans full width. design-system §3b.
 */
export function ContentColumn({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View style={[{ flex: 1, alignItems: 'center' }, style]}>
      <View style={{ flex: 1, width: '100%', maxWidth: CONTENT_MAX, paddingHorizontal: space[5] }}>
        {children}
      </View>
    </View>
  );
}

/**
 * The primary action. Full width OF THE COLUMN, never of the screen.
 * One per screen, ever (Principle II).
 */
export function Pill({
  label,
  onPress,
  accessibilityHint,
}: {
  label: string;
  onPress: () => void;
  accessibilityHint?: string;
}) {
  const p = usePalette();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => ({
        backgroundColor: p.ink,
        borderRadius: radius.pill,
        minHeight: 56,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: space[5],
        // Press feedback is opacity only — never a transform that shifts layout.
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text style={[emphasis, { color: p.onInk }]}>{label}</Text>
    </Pressable>
  );
}

/** Secondary actions. Text only, visually subordinate to the single pill. */
export function TextAction({ label, onPress }: { label: string; onPress: () => void }) {
  const p = usePalette();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={12}
      style={({ pressed }) => ({
        minHeight: MIN_TARGET,
        justifyContent: 'center',
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Text style={{ fontSize: 15, color: p.inkSecondary }}>{label}</Text>
    </Pressable>
  );
}

/** Decorative separator. No contrast requirement — see design-system §1. */
export function Rule() {
  const p = usePalette();
  return <View style={{ height: 1, backgroundColor: p.rule }} />;
}

export { useSizeClass };
