import { useCallback, useMemo, useRef, useState } from 'react';
import { Keyboard, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Crow } from '../src/companion/Crow';
import { capture } from '../src/db';
import { companion, pick, ui } from '../src/ui/copy.catalogue';
import { ContentColumn, Pill } from '../src/ui/primitives';
import { usePalette, useSizeClass } from '../src/ui/theme';
import { space } from '../src/ui/tokens';
import { fieldInput, hero, meta, supporting } from '../src/ui/type';
import type { CompanionState } from '../src/companion/states.manifest';

export default function Capture() {
  const p = usePalette();
  const size = useSizeClass();
  const insets = useSafeAreaInsets();
  const input = useRef<TextInput>(null);

  const [text, setText] = useState('');
  const [state, setState] = useState<CompanionState>('idle');
  const [ack, setAck] = useState<string | null>(null);

  // Stable for the session so the greeting does not flicker on re-render.
  const greeting = useMemo(() => pick(companion.arrive, Date.now()), []);

  const commit = useCallback(() => {
    const value = text.trim();
    if (!value) return;
    capture(value, 'in_app');
    setText('');
    setAck(pick(companion.held, Date.now()));
    setState('acknowledging');
    // Field stays focused — submitting never navigates away (FR-004).
    input.current?.focus();
    setTimeout(() => setState('idle'), 1200);
  }, [text]);

  return (
    <View style={{ flex: 1, backgroundColor: p.paper }}>
      <ContentColumn
        style={{
          paddingTop: insets.top + space[4],
          paddingBottom: insets.bottom + space[4],
        }}
      >
        {/* Header: companion + a way into the inbox. No counts here. */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: space[7],
          }}
        >
          <Crow state={state} size={30} />
          <View style={{ flexDirection: 'row', gap: space[5] }}>
            <Pressable
              onPress={() => router.push('/now')}
              accessibilityRole="button"
              accessibilityLabel="Now"
              hitSlop={16}
              style={{ minHeight: 48, justifyContent: 'center' }}
            >
              <Text style={[meta, { color: p.ink }]}>Now</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/map')}
              accessibilityRole="button"
              accessibilityLabel={ui.openMap}
              hitSlop={16}
              style={{ minHeight: 48, justifyContent: 'center' }}
            >
              <Text style={[meta, { color: p.inkMuted }]}>{ui.openMap}</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/inbox')}
              accessibilityRole="button"
              accessibilityLabel={ui.openInbox}
              hitSlop={16}
              style={{ minHeight: 48, justifyContent: 'center' }}
            >
              <Text style={[meta, { color: p.inkMuted }]}>{ui.openInbox}</Text>
            </Pressable>
          </View>
        </View>

        {/* The hero. One thing on screen, unmistakably. */}
        <Text style={[hero(size), { color: p.ink, marginBottom: space[3] }]}>
          {ui.capturePrompt}
        </Text>
        <Text style={[supporting, { color: p.inkSecondary, marginBottom: space[7] }]}>
          {ack ?? greeting}
        </Text>

        <View style={{ flex: 1 }} />

        {/* The field. 2px ink underline — 14.7:1, so it clears WCAG 1.4.11
            outright without needing a heavy box border. */}
        <TextInput
          ref={input}
          value={text}
          onChangeText={setText}
          onFocus={() => setState('attentive')}
          onBlur={() => setState('idle')}
          autoFocus
          multiline
          blurOnSubmit={false}
          onSubmitEditing={commit}
          returnKeyType="done"
          placeholder={ui.capturePlaceholder}
          placeholderTextColor={p.inkMuted}
          accessibilityLabel={ui.capturePrompt}
          style={[
            fieldInput(size),
            {
              color: p.ink,
              borderBottomWidth: 2,
              borderBottomColor: p.ink,
              paddingBottom: space[2],
              marginBottom: space[3],
              maxHeight: 160,
            },
          ]}
        />
        <Text style={[meta, { color: p.inkMuted, marginBottom: space[5] }]}>{ui.captureHint}</Text>

        <Pill label={ui.holdIt} onPress={commit} accessibilityHint="Saves and clears the field" />
      </ContentColumn>
    </View>
  );
}
