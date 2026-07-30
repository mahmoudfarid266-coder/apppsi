import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  addPerson,
  listPeople,
  listTiers,
  logInteraction,
  type Person,
} from '../src/db/systems';
import { ContentColumn, Rule } from '../src/ui/primitives';
import { usePalette, useSizeClass } from '../src/ui/theme';
import { radius, space } from '../src/ui/tokens';
import { body, hero, meta, supporting } from '../src/ui/type';

/**
 * Bonds — the personal CRM. Your tiers, verbatim, including `myself`.
 *
 * Drift is DERIVED from the interactions log, never a stored timestamp, so a
 * two-device edit cannot silently reset someone's drift.
 *
 * Drift is never rendered as a neglect score, a red badge, or a ranked list of
 * people you are failing. Sorting puts the most drifted first because that is
 * useful, and the copy states time plainly — "4 months" — with no adjective.
 */
export default function People() {
  const p = usePalette();
  const size = useSizeClass();
  const insets = useSafeAreaInsets();

  const [people, setPeople] = useState<Person[]>([]);
  const [tiers, setTiers] = useState<Array<{ id: string; label: string; cadence_days: number }>>([]);
  const [draft, setDraft] = useState('');
  const [tierId, setTierId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    const t = await listTiers();
    setTiers(t);
    if (!tierId && t.length) setTierId(t.find((x) => x.label === 'close friends')?.id ?? t[0].id);
    setPeople(await listPeople());
  }, [tierId]);

  useEffect(() => {
    void load();
  }, [load]);

  const add = async () => {
    const n = draft.trim();
    if (!n || !tierId) return;
    await addPerson(n, tierId);
    setDraft('');
    await load();
  };

  const since = (d: number | null) => {
    if (d === null) return 'not yet';
    if (d === 0) return 'today';
    if (d === 1) return 'yesterday';
    if (d < 30) return `${d} days`;
    if (d < 365) return `${Math.round(d / 30)} months`;
    return `${Math.round(d / 365)} years`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: p.paper }}>
      <ContentColumn style={{ paddingTop: insets.top + space[4] }}>
        <Pressable onPress={() => router.back()} hitSlop={16} style={{ minHeight: 48, justifyContent: 'center' }}>
          <Text style={[meta, { color: p.inkMuted }]}>Back</Text>
        </Pressable>

        <Text style={[hero(size), { color: p.ink, marginTop: space[4] }]}>people</Text>
        <Text style={[supporting, { color: p.inkSecondary, marginTop: space[2], marginBottom: space[6] }]}>
          Who you want to stay close to, and how often. Including yourself.
        </Text>

        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + space[7] }}>
          {people.map((person) => (
            <View key={person.id}>
              <Pressable
                onPress={() => setOpenId(openId === person.id ? null : person.id)}
                style={{ paddingVertical: space[4] }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={[body, { color: p.ink, flex: 1 }]}>{person.displayName}</Text>
                  <Text style={[meta, { color: p.inkMuted }]}>{since(person.daysSince)}</Text>
                </View>
                <Text style={[meta, { color: p.inkMuted, marginTop: space[1] }]}>
                  {person.tierLabel} · every {person.cadenceDays}d
                  {person.lastTopic ? ` · ${person.lastTopic}` : ''}
                </Text>

                {openId === person.id && (
                  <View style={{ marginTop: space[4] }}>
                    <TextInput
                      value={note}
                      onChangeText={setNote}
                      placeholder="what did you talk about?"
                      placeholderTextColor={p.inkMuted}
                      style={[
                        supporting,
                        {
                          color: p.ink,
                          borderBottomWidth: 2,
                          borderBottomColor: p.ink,
                          paddingBottom: space[2],
                          marginBottom: space[4],
                        },
                      ]}
                    />
                    <View style={{ flexDirection: 'row', gap: space[3] }}>
                      {(['message', 'call', 'hangout'] as const).map((kind) => (
                        <Pressable
                          key={kind}
                          onPress={async () => {
                            await logInteraction(person.id, kind, note.trim() || undefined);
                            setNote('');
                            setOpenId(null);
                            await load();
                          }}
                          style={{
                            paddingVertical: space[3],
                            paddingHorizontal: space[4],
                            borderRadius: radius.pill,
                            backgroundColor: p.sunken,
                            minHeight: 48,
                            justifyContent: 'center',
                          }}
                        >
                          <Text style={[meta, { color: p.ink }]}>{kind}</Text>
                        </Pressable>
                      ))}
                    </View>
                    <Text style={[meta, { color: p.inkMuted, marginTop: space[3] }]}>
                      A hangout is not the same as a message. Both count, separately.
                    </Text>
                  </View>
                )}
              </Pressable>
              <Rule />
            </View>
          ))}

          <View style={{ marginTop: space[6] }}>
            <Text style={[meta, { color: p.inkMuted, marginBottom: space[3] }]}>Add someone</Text>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={add}
              placeholder="name"
              placeholderTextColor={p.inkMuted}
              style={[
                body,
                { color: p.ink, borderBottomWidth: 2, borderBottomColor: p.ink, paddingBottom: space[2] },
              ]}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: space[4] }}>
              {tiers.map((t) => (
                <Pressable
                  key={t.id}
                  onPress={() => setTierId(t.id)}
                  style={{
                    paddingVertical: space[3],
                    paddingHorizontal: space[4],
                    marginRight: space[2],
                    borderRadius: radius.pill,
                    backgroundColor: tierId === t.id ? p.ink : p.sunken,
                    minHeight: 48,
                    justifyContent: 'center',
                  }}
                >
                  <Text style={[meta, { color: tierId === t.id ? p.onInk : p.ink }]}>{t.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </ContentColumn>
    </View>
  );
}
