import { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { SELF_MAINTENANCE, SOLO_QUESTS } from '../src/content/curriculum';
import { addHabit, listHabits, markHabit, type Habit } from '../src/db/systems';
import { completeSolo, completedSolo } from '../src/db/wellbeing';
import { ui } from '../src/ui/copy.catalogue';
import { Enter, FillTrack, Press } from '../src/ui/motion';
import { ContentColumn, Rule } from '../src/ui/primitives';
import { usePalette, useSizeClass } from '../src/ui/theme';
import { radius, space } from '../src/ui/tokens';
import { body, hero, meta, supporting, tabular } from '../src/ui/type';

/**
 * Solitude — being alone as a SKILL, never a consolation prize.
 *
 * Shown as a path, not a checklist: completed nodes are ink, the next is accent
 * and labelled "next", future nodes are sunken. Progression is user-paced and
 * never gated on a schedule.
 *
 * Self-maintenance rides on cadence rhythms so a quiet week is arithmetic. None
 * of it is ever counted as a failure.
 */
export default function Solitude() {
  const p = usePalette();
  const size = useSizeClass();
  const insets = useSafeAreaInsets();

  const [done, setDone] = useState<Set<string>>(new Set());
  const [care, setCare] = useState<Habit[]>([]);

  const load = useCallback(async () => {
    setDone(await completedSolo());
    const all = await listHabits();
    const names = new Set(SELF_MAINTENANCE.map(([t]) => t));
    setCare(all.filter((h) => names.has(h.title)));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const seedCare = async () => {
    for (const [t, n] of SELF_MAINTENANCE) await addHabit(t, n, 'week');
    await load();
  };

  const nextIndex = SOLO_QUESTS.findIndex((q) => !done.has(q.id));

  return (
    <View style={{ flex: 1, backgroundColor: p.paper }}>
      <ContentColumn style={{ paddingTop: insets.top + space[4] }}>
        <Press onPress={() => router.back()} accessibilityLabel={ui.back} style={{ minHeight: 48, justifyContent: 'center' }}>
          <Text style={[meta, { color: p.inkMuted }]}>{ui.back}</Text>
        </Press>

        <Text style={[hero(size), { color: p.ink, marginTop: space[4] }]}>solitude</Text>
        <Text style={[supporting, { color: p.inkSecondary, marginTop: space[2], marginBottom: space[7] }]}>
          Learning to be alone without it registering as failing. A skill, like any other.
        </Text>

        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + space[7] }}>
          {/* The path. Completed = ink, next = accent, future = sunken. */}
          {SOLO_QUESTS.map((q, i) => {
            const isDone = done.has(q.id);
            const isNext = i === nextIndex;
            const dot = isDone ? p.ink : isNext ? p.accent : p.sunken;
            return (
              <Enter key={q.id} delay={i * 40}>
                <Press
                  onPress={async () => {
                    if (isDone) return;
                    await completeSolo(q.id);
                    await load();
                  }}
                  accessibilityLabel={q.title}
                  style={{ flexDirection: 'row', paddingVertical: space[3] }}
                >
                  {/* node + connector */}
                  <View style={{ width: 32, alignItems: 'center' }}>
                    <View
                      style={{
                        width: isNext ? 18 : 14,
                        height: isNext ? 18 : 14,
                        borderRadius: radius.pill,
                        backgroundColor: dot,
                      }}
                    />
                    {i < SOLO_QUESTS.length - 1 && (
                      <View style={{ width: 2, flex: 1, minHeight: 34, backgroundColor: isDone ? p.ink : p.sunken }} />
                    )}
                  </View>
                  <View style={{ flex: 1, paddingBottom: space[4] }}>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space[2] }}>
                      <Text style={[body, { color: isDone ? p.inkSecondary : p.ink, flex: 1 }]}>
                        {q.title}
                      </Text>
                      {isNext && <Text style={[meta, { color: p.accent }]}>next</Text>}
                    </View>
                    <Text style={[meta, { color: p.inkMuted, marginTop: space[1] }]}>{q.note}</Text>
                  </View>
                </Press>
              </Enter>
            );
          })}

          {/* Self-maintenance — cadence, filling tracks, never counted against you. */}
          <Text style={[hero(size), { color: p.ink, fontSize: 26, marginTop: space[7], marginBottom: space[2] }]}>
            keeping the place
          </Text>
          <Text style={[supporting, { color: p.inkSecondary, marginBottom: space[5] }]}>
            The things that go quiet first. Cadence, not every day.
          </Text>

          {care.length === 0 ? (
            <Press
              onPress={seedCare}
              accessibilityLabel={ui.addBasics}
              style={{
                backgroundColor: p.sunken,
                borderRadius: radius.card,
                padding: space[5],
                minHeight: 48,
              }}
            >
              <Text style={[body, { color: p.ink }]}>{ui.addBasics}</Text>
              <Text style={[meta, { color: p.inkMuted, marginTop: space[1] }]}>
                {ui.basicsHint}
              </Text>
            </Press>
          ) : (
            care.map((h) => (
              <View key={h.id}>
                <Press
                  onPress={async () => {
                    await markHabit(h.id);
                    await load();
                  }}
                  accessibilityLabel={h.title}
                  style={{ paddingVertical: space[4] }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[body, { color: p.ink, flex: 1 }]}>{h.title}</Text>
                    <Text style={[meta, tabular, { color: p.inkMuted }]}>
                      {h.doneThisPeriod} of {h.targetCount}
                    </Text>
                  </View>
                  <View style={{ marginTop: space[3] }}>
                    <FillTrack pct={h.doneThisPeriod / h.targetCount} track={p.sunken} fill={p.ink} />
                  </View>
                </Press>
                <Rule />
              </View>
            ))
          )}
        </ScrollView>
      </ContentColumn>
    </View>
  );
}
