import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  addCheckIn,
  addJournal,
  addMenuItem,
  currentState,
  declareState,
  listMenu,
  type MenuItem,
} from '../src/db/systems';
import { ContentColumn, Pill, Rule } from '../src/ui/primitives';
import { usePalette, useSizeClass } from '../src/ui/theme';
import { radius, space } from '../src/ui/tokens';
import { body, hero, meta, supporting } from '../src/ui/type';

const COURSES = ['starter', 'main', 'side', 'dessert', 'special'] as const;

const COURSE_HINT: Record<string, string> = {
  starter: 'quick, low energy',
  main: 'takes a bit more',
  side: 'goes with something else',
  dessert: 'easy to overdo — your call',
  special: 'occasional, needs planning',
};

/**
 * Regulation — the dopamine menu, state declaration, and a two-tap check-in.
 *
 * `dessert` is the person's OWN label for something they can overdo. The app
 * never reclassifies an item and never scores one as unhealthy. Choosing a
 * dessert is not logged as a failure and nothing is counted.
 */
export default function Reset() {
  const p = usePalette();
  const size = useSizeClass();
  const insets = useSafeAreaInsets();

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [state, setState] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [course, setCourse] = useState<string>('starter');
  const [journal, setJournal] = useState('');
  const [energy, setEnergy] = useState<number | null>(null);

  const load = useCallback(async () => {
    setMenu(await listMenu());
    setState(await currentState());
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const overstim = state === 'overstimulated';

  return (
    <View style={{ flex: 1, backgroundColor: p.paper }}>
      <ContentColumn style={{ paddingTop: insets.top + space[4] }}>
        <Pressable onPress={() => router.back()} hitSlop={16} style={{ minHeight: 48, justifyContent: 'center' }}>
          <Text style={[meta, { color: p.inkMuted }]}>Back</Text>
        </Pressable>

        <Text style={[hero(size), { color: p.ink, marginTop: space[4] }]}>reset</Text>

        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + space[7] }}>
          {/* State — one tap, from anywhere */}
          <View style={{ marginTop: space[5], marginBottom: space[6] }}>
            <Pill
              label={overstim ? "I'm okay now" : "It's too much right now"}
              onPress={async () => {
                await declareState(overstim ? 'clear' : 'overstimulated');
                await load();
              }}
            />
            {overstim && (
              <Text style={[supporting, { color: p.accent, marginTop: space[3] }]}>
                Everything else is paused. Only these are on offer.
              </Text>
            )}
          </View>

          {/* Two-tap check-in */}
          <Text style={[meta, { color: p.inkMuted, marginBottom: space[3] }]}>How's the tank?</Text>
          <View style={{ flexDirection: 'row', gap: space[2], marginBottom: space[6] }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable
                key={n}
                onPress={async () => {
                  setEnergy(n);
                  await addCheckIn(n, n, n);
                }}
                style={{
                  flex: 1,
                  minHeight: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: radius.field,
                  backgroundColor: energy === n ? p.ink : p.sunken,
                }}
              >
                <Text style={[body, { color: energy === n ? p.onInk : p.ink }]}>{n}</Text>
              </Pressable>
            ))}
          </View>

          {/* Dopamine menu */}
          <Text style={[hero(size), { color: p.ink, fontSize: 26, marginBottom: space[2] }]}>
            the menu
          </Text>
          <Text style={[supporting, { color: p.inkSecondary, marginBottom: space[5] }]}>
            What actually helps, written down before you need it.
          </Text>

          {COURSES.map((c) => {
            const items = menu.filter((m) => m.course === c);
            if (items.length === 0) return null;
            return (
              <View key={c} style={{ marginBottom: space[5] }}>
                <Text style={[meta, { color: p.inkMuted, marginBottom: space[2] }]}>
                  {c} — {COURSE_HINT[c]}
                </Text>
                {items.map((m) => (
                  <View key={m.id}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: space[3] }}>
                      <Text style={[body, { color: p.ink, flex: 1 }]}>{m.label}</Text>
                      {m.minutes != null && (
                        <Text style={[meta, { color: p.inkMuted }]}>{m.minutes}m</Text>
                      )}
                    </View>
                    <Rule />
                  </View>
                ))}
              </View>
            );
          })}

          {/* Add to menu */}
          <Text style={[meta, { color: p.inkMuted, marginBottom: space[3] }]}>Add to the menu</Text>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={async () => {
              const t = draft.trim();
              if (!t) return;
              await addMenuItem(t, course, null);
              setDraft('');
              await load();
            }}
            placeholder="what helps?"
            placeholderTextColor={p.inkMuted}
            style={[body, { color: p.ink, borderBottomWidth: 2, borderBottomColor: p.ink, paddingBottom: space[2] }]}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: space[3] }}>
            {COURSES.map((c) => (
              <Pressable
                key={c}
                onPress={() => setCourse(c)}
                style={{
                  paddingVertical: space[3],
                  paddingHorizontal: space[4],
                  marginRight: space[2],
                  borderRadius: radius.pill,
                  backgroundColor: course === c ? p.ink : p.sunken,
                  minHeight: 48,
                  justifyContent: 'center',
                }}
              >
                <Text style={[meta, { color: course === c ? p.onInk : p.ink }]}>{c}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Journal */}
          <Text style={[meta, { color: p.inkMuted, marginTop: space[7], marginBottom: space[3] }]}>
            Anything you want to put down
          </Text>
          <TextInput
            value={journal}
            onChangeText={setJournal}
            multiline
            placeholder="…"
            placeholderTextColor={p.inkMuted}
            style={[
              body,
              {
                color: p.ink,
                minHeight: 90,
                borderRadius: radius.field,
                backgroundColor: p.surface,
                padding: space[4],
                textAlignVertical: 'top',
              },
            ]}
          />
          <View style={{ marginTop: space[4] }}>
            <Pill
              label="Keep it"
              onPress={async () => {
                const t = journal.trim();
                if (!t) return;
                await addJournal(t);
                setJournal('');
              }}
            />
          </View>
        </ScrollView>
      </ContentColumn>
    </View>
  );
}
