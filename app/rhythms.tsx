import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { addHabit, listHabits, markHabit, type Habit } from '../src/db/systems';
import { ui } from '../src/ui/copy.catalogue';
import { FillTrack } from '../src/ui/motion';
import { ContentColumn, Rule } from '../src/ui/primitives';
import { usePalette, useSizeClass } from '../src/ui/theme';
import { radius, space } from '../src/ui/tokens';
import { body, hero, meta, supporting, tabular } from '../src/ui/type';

/**
 * Habits use CADENCE, not a daily binary — "3 times a week", not "every day".
 * A miss is arithmetic, not a broken streak (Principle IV).
 *
 * There is no streak number on this screen at all. Progress is shown as a
 * FILLING track: it fills, it never drains, and it never reports a shortfall.
 */
export default function Rhythms() {
  const p = usePalette();
  const size = useSizeClass();
  const insets = useSafeAreaInsets();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [draft, setDraft] = useState('');
  const [target, setTarget] = useState('3');

  const load = useCallback(async () => setHabits(await listHabits()), []);
  useEffect(() => {
    void load();
  }, [load]);

  const add = async () => {
    const t = draft.trim();
    if (!t) return;
    await addHabit(t, Math.max(1, parseInt(target, 10) || 1), 'week');
    setDraft('');
    await load();
  };

  return (
    <View style={{ flex: 1, backgroundColor: p.paper }}>
      <ContentColumn style={{ paddingTop: insets.top + space[4] }}>
        <Pressable onPress={() => router.back()} hitSlop={16} style={{ minHeight: 48, justifyContent: 'center' }}>
          <Text style={[meta, { color: p.inkMuted }]}>Back</Text>
        </Pressable>

        <Text style={[hero(size), { color: p.ink, marginTop: space[4] }]}>rhythms</Text>
        <Text style={[supporting, { color: p.inkSecondary, marginTop: space[2], marginBottom: space[6] }]}>
          Times per week, not every day. A quiet week is arithmetic, not a failure.
        </Text>

        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + space[7] }}>
          {habits.map((h) => {
            const pct = Math.min(1, h.doneThisPeriod / h.targetCount);
            return (
              <View key={h.id}>
                <Pressable
                  onPress={async () => {
                    await markHabit(h.id);
                    await load();
                  }}
                  style={{ paddingVertical: space[4] }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[body, { color: p.ink, flex: 1 }]}>{h.title}</Text>
                    <Text style={[meta, tabular, { color: p.inkMuted }]}>
                      {h.doneThisPeriod} of {h.targetCount}
                    </Text>
                  </View>
                  {/* Fills. Never drains. Height 10 per the component spec. */}
                  <View style={{ marginTop: space[3] }}>
                    <FillTrack pct={pct} track={p.sunken} fill={p.ink} />
                  </View>
                </Pressable>
                <Rule />
              </View>
            );
          })}

          <View style={{ marginTop: space[6] }}>
            <Text style={[meta, { color: p.inkMuted, marginBottom: space[3] }]}>{ui.addRhythm}</Text>
            <View style={{ flexDirection: 'row', gap: space[4], alignItems: 'flex-end' }}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                onSubmitEditing={add}
                placeholder="what do you want to keep doing?"
                placeholderTextColor={p.inkMuted}
                style={[
                  body,
                  { flex: 1, color: p.ink, borderBottomWidth: 2, borderBottomColor: p.ink, paddingBottom: space[2] },
                ]}
              />
              <TextInput
                value={target}
                onChangeText={setTarget}
                keyboardType="number-pad"
                style={[
                  body,
                  tabular,
                  {
                    width: 44,
                    textAlign: 'center',
                    color: p.ink,
                    borderBottomWidth: 2,
                    borderBottomColor: p.ink,
                    paddingBottom: space[2],
                  },
                ]}
              />
              <Text style={[meta, { color: p.inkMuted, paddingBottom: space[2] }]}>/wk</Text>
            </View>
          </View>
        </ScrollView>
      </ContentColumn>
    </View>
  );
}
