import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Crow } from '../src/companion/Crow';
import { listQuests, completeQuest } from '../src/db/places';
import {
  currentState,
  declareState,
  latestCheckIn,
  listHabits,
  listMenu,
  listPeople,
  logInteraction,
  markHabit,
  totalXp,
} from '../src/db/systems';
import { computeLoad, nextAction, type Candidate, type Context } from '../src/domain/scorer';
import { ui } from '../src/ui/copy.catalogue';
import { ContentColumn, Pill, TextAction } from '../src/ui/primitives';
import { usePalette, useSizeClass } from '../src/ui/theme';
import { space } from '../src/ui/tokens';
import { hero, meta, supporting, tabular } from '../src/ui/type';

export default function Now() {
  const p = usePalette();
  const size = useSizeClass();
  const insets = useSafeAreaInsets();

  const [pick, setPick] = useState<ReturnType<typeof nextAction>>(null);
  const [ctx, setCtx] = useState<Context | null>(null);
  const [xp, setXp] = useState(0);
  const [skipped, setSkipped] = useState<Set<string>>(new Set());

  const build = useCallback(async () => {
    const [quests, habits, people, menu, check, state, x] = await Promise.all([
      listQuests(),
      listHabits(),
      listPeople(),
      listMenu(),
      latestCheckIn(),
      currentState(),
      totalXp(),
    ]);

    const load = computeLoad({
      overstimDeclarationsLast7d: state === 'overstimulated' ? 3 : 0,
      hoursSinceLastBreak: 3,
      socialInteractionsLast2d: 0,
      sleepDebtHours: 0,
    });

    const context: Context = {
      now: Date.now(),
      load,
      energy: check?.energy ?? null,
      minutesFree: null,
      declared: (state as Context['declared']) ?? null,
    };

    const candidates: Candidate[] = [];

    for (const q of quests) {
      candidates.push({
        id: `q:${q.id}`,
        title: q.title,
        system: 'quest',
        effort: 'medium',
        estimateMinutes: q.estimateMinutes ?? undefined,
      });
    }

    for (const h of habits) {
      if (h.doneThisPeriod >= h.targetCount) continue;
      candidates.push({
        id: `h:${h.id}`,
        title: h.title,
        system: 'rhythm',
        effort: 'low',
        overdue: 1 - h.doneThisPeriod / h.targetCount,
      });
    }

    // Bonds compete on equal footing — a drifting friend can outrank a task.
    for (const person of people) {
      if (person.drift < 0.8) continue;
      candidates.push({
        id: `p:${person.id}`,
        title: person.lastTopic
          ? `Message ${person.displayName} — last time: ${person.lastTopic}`
          : `Message ${person.displayName}`,
        system: 'bond',
        effort: 'low',
        estimateMinutes: 5,
        overdue: person.drift,
      });
    }

    // Regulation. These are what rise as load rises, and the only thing offered
    // once overstimulation is declared.
    for (const m of menu.filter((x) => x.course === 'starter' || x.course === 'main')) {
      candidates.push({
        id: `m:${m.id}`,
        title: m.label,
        system: 'regulation',
        effort: m.effort as Candidate['effort'],
        estimateMinutes: m.minutes ?? undefined,
        isRegulation: true,
      });
    }

    setCtx(context);
    setXp(x);
    setPick(nextAction(candidates.filter((c) => !skipped.has(c.id)), context));
  }, [skipped]);

  useEffect(() => {
    void build();
  }, [build]);

  const doIt = async () => {
    if (!pick) return;
    const [kind, id] = pick.candidate.id.split(':');
    if (kind === 'q') await completeQuest(id);
    if (kind === 'h') await markHabit(id);
    if (kind === 'p') await logInteraction(id, 'message');
    setSkipped(new Set());
    await build();
  };

  const notNow = () => {
    if (!pick) return;
    setSkipped((s) => new Set(s).add(pick.candidate.id));
  };

  const overstim = ctx?.declared === 'overstimulated';

  return (
    <View style={{ flex: 1, backgroundColor: p.paper }}>
      <ContentColumn
        style={{ paddingTop: insets.top + space[4], paddingBottom: insets.bottom + space[4] }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Crow state={pick ? 'attentive' : 'idle'} size={30} />
          <Text style={[meta, tabular, { color: p.inkMuted }]}>{xp} xp</Text>
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flex: 1, justifyContent: 'center', paddingVertical: space[7] }}>
            {pick ? (
              <>
                <Text style={[supporting, { color: p.inkSecondary, marginBottom: space[3] }]}>
                  {overstim ? 'just this.' : 'one thing.'}
                </Text>
                <Text style={[hero(size), { color: p.ink, marginBottom: space[3] }]}>
                  {pick.candidate.title}
                </Text>
                {!!pick.why && (
                  <Text style={[supporting, { color: p.accent }]}>{pick.why}</Text>
                )}
              </>
            ) : (
              <Text style={[hero(size), { color: p.ink }]}>Nothing needs you right now.</Text>
            )}
          </View>
        </ScrollView>

        {pick && (
          <>
            <Pill label={ui.doIt} onPress={doIt} />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: space[2],
                marginBottom: space[4],
              }}
            >
              <TextAction label={ui.notNow} onPress={notNow} />
              <TextAction label={ui.somethingElse} onPress={notNow} />
            </View>
          </>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <TextAction label="Capture" onPress={() => router.push('/')} />
          <TextAction label="Places" onPress={() => router.push('/map')} />
          <TextAction label="Rhythms" onPress={() => router.push('/rhythms')} />
          <TextAction label="People" onPress={() => router.push('/people')} />
          <TextAction label="Reset" onPress={() => router.push('/reset')} />
        </View>

        <Pressable
          onPress={async () => {
            await declareState(overstim ? 'clear' : 'overstimulated');
            await build();
          }}
          hitSlop={12}
          style={{ minHeight: 48, justifyContent: 'center' }}
        >
          <Text style={[meta, { color: overstim ? p.accent : p.inkMuted }]}>
            {overstim ? "I'm okay now" : "It's too much right now"}
          </Text>
        </Pressable>
      </ContentColumn>
    </View>
  );
}
