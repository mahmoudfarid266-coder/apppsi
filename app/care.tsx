import { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import {
  addMed,
  getSleep,
  listMeds,
  logMed,
  setSleep,
  sleepWindow,
  type Medication,
} from '../src/db/wellbeing';
import { scheduleDaily } from '../src/lib/notify';
import { care as copy, ui } from '../src/ui/copy.catalogue';
import { Enter, Press } from '../src/ui/motion';
import { ContentColumn, Rule } from '../src/ui/primitives';
import { usePalette, useSizeClass } from '../src/ui/theme';
import { radius, space } from '../src/ui/tokens';
import { body, hero, meta, supporting, tabular } from '../src/ui/type';

const STATES = ['taken', 'skipped', 'late'] as const;
const ARC = 210;

/**
 * Care — medication and sleep.
 *
 * ⚠️ A LOG AND A REMINDER, NEVER A DOSING ENGINE. Dose is free text. No drug
 * database ships, nothing suggests or adjusts an amount, and there is NO
 * ADHERENCE PERCENTAGE ANYWHERE — a missed dose is never counted or scored
 * (constitution, Security §; FR-3.8).
 *
 * Sleep is computed BACKWARDS from wake time. No sleep tracking, no sleep
 * score, no quality rating (FR-3.7).
 */
export default function Care() {
  const p = usePalette();
  const size = useSizeClass();
  const insets = useSafeAreaInsets();

  const [meds, setMeds] = useState<Medication[]>([]);
  const [name, setName] = useState('');
  const [times, setTimes] = useState('');
  const [wake, setWake] = useState('07:00');
  const [hours, setHours] = useState('8');
  const [sleepSet, setSleepSet] = useState(false);

  const load = useCallback(async () => {
    setMeds(await listMeds());
    const s = await getSleep();
    if (s) {
      setWake(`${String(s.wake_hour).padStart(2, '0')}:${String(s.wake_minute).padStart(2, '0')}`);
      setHours(String(s.target_hours));
      setSleepSet(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const saveSleep = async () => {
    const [h, m] = wake.split(':').map((n) => parseInt(n, 10));
    if (Number.isNaN(h)) return;
    const target = Math.max(4, Math.min(12, parseInt(hours, 10) || 8));
    await setSleep(h, m || 0, target);
    const w = sleepWindow(h, m || 0, target, 45);
    const [wh, wm] = w.winddown.split(':').map(Number);
    await scheduleDaily('winddown', wh, wm, copy.windDownTitle, copy.windDownBody);
    setSleepSet(true);
    await load();
  };

  const addMedication = async () => {
    const n = name.trim();
    if (!n) return;
    const list = times.split(',').map((t) => t.trim()).filter(Boolean);
    const id = await addMed(n, '', list);
    // Medication reminders may repeat until acknowledged and are exempt from
    // quiet hours — the only notification class that is.
    for (const [i, t] of list.entries()) {
      const [h, m] = t.split(':').map(Number);
      if (!Number.isNaN(h)) await scheduleDaily(`med-${id}-${i}`, h, m || 0, copy.medTitle, n);
    }
    setName('');
    setTimes('');
    await load();
  };

  const [h, m] = wake.split(':').map((n) => parseInt(n, 10) || 0);
  const win = sleepWindow(h, m, parseInt(hours, 10) || 8, 45);
  const R = 92;
  const C = 2 * Math.PI * R;

  return (
    <View style={{ flex: 1, backgroundColor: p.paper }}>
      <ContentColumn style={{ paddingTop: insets.top + space[4] }}>
        <Press onPress={() => router.back()} accessibilityLabel={ui.back} style={{ minHeight: 48, justifyContent: 'center' }}>
          <Text style={[meta, { color: p.inkMuted }]}>{ui.back}</Text>
        </Press>

        <Text style={[hero(size), { color: p.ink, marginTop: space[4] }]}>care</Text>
        <Text style={[supporting, { color: p.inkSecondary, marginTop: space[2], marginBottom: space[7] }]}>
          {copy.subtitle}
        </Text>

        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + space[7] }}>
          {/* ---- medication ---- */}
          {meds.map((med, i) => (
            <Enter key={med.id} delay={i * 40}>
              <View style={{ paddingVertical: space[4] }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={[body, { color: p.ink, flex: 1 }]}>{med.name}</Text>
                  <Text style={[meta, tabular, { color: p.inkMuted }]}>{med.times.join(' · ')}</Text>
                </View>
                {/* One tap. No adherence figure, ever. */}
                <View style={{ flexDirection: 'row', gap: space[2], marginTop: space[3] }}>
                  {STATES.map((st) => (
                    <Press
                      key={st}
                      onPress={async () => {
                        await logMed(med.id, st);
                        await load();
                      }}
                      accessibilityLabel={`${med.name} ${st}`}
                      style={{
                        minHeight: 44,
                        justifyContent: 'center',
                        paddingHorizontal: space[4],
                        borderRadius: radius.pill,
                        backgroundColor: p.sunken,
                      }}
                    >
                      <Text style={[meta, { color: p.ink }]}>{st}</Text>
                    </Press>
                  ))}
                </View>
              </View>
              <Rule />
            </Enter>
          ))}

          <View style={{ marginTop: space[5], marginBottom: space[7] }}>
            <Text style={[meta, { color: p.inkMuted, marginBottom: space[3] }]}>{copy.addMed}</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={copy.medNamePlaceholder}
              placeholderTextColor={p.inkMuted}
              style={[body, { color: p.ink, borderBottomWidth: 2, borderBottomColor: p.ink, paddingBottom: space[2], marginBottom: space[4] }]}
            />
            <TextInput
              value={times}
              onChangeText={setTimes}
              onSubmitEditing={addMedication}
              placeholder={copy.medTimesPlaceholder}
              placeholderTextColor={p.inkMuted}
              style={[body, tabular, { color: p.ink, borderBottomWidth: 2, borderBottomColor: p.ink, paddingBottom: space[2] }]}
            />
          </View>

          {/* ---- sleep: computed backwards from wake ---- */}
          <Text style={[hero(size), { color: p.ink, fontSize: 26, marginBottom: space[2] }]}>
            {copy.sleepTitle}
          </Text>
          <Text style={[supporting, { color: p.inkSecondary, marginBottom: space[6] }]}>
            {copy.sleepSub}
          </Text>

          <View style={{ alignItems: 'center', marginBottom: space[6] }}>
            <Svg width={216} height={216}>
              <Circle cx={108} cy={108} r={R} stroke={p.sunken} strokeWidth={14} fill="none" />
              <Circle
                cx={108}
                cy={108}
                r={R}
                stroke={p.ink}
                strokeWidth={14}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${(C * ARC) / 360} ${C}`}
                transform={`rotate(${90 + win.bedMinutes / 4} 108 108)`}
              />
            </Svg>
            <Text style={[meta, tabular, { color: p.inkMuted, marginTop: space[4] }]}>
              {copy.windDown} {win.winddown} · {copy.bed} {win.bedtime} · {copy.wake} {wake}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: space[4], alignItems: 'flex-end', marginBottom: space[5] }}>
            <View style={{ flex: 1 }}>
              <Text style={[meta, { color: p.inkMuted, marginBottom: space[2] }]}>{copy.wakeAt}</Text>
              <TextInput
                value={wake}
                onChangeText={setWake}
                onSubmitEditing={saveSleep}
                placeholder="07:00"
                placeholderTextColor={p.inkMuted}
                style={[body, tabular, { color: p.ink, borderBottomWidth: 2, borderBottomColor: p.ink, paddingBottom: space[2] }]}
              />
            </View>
            <View style={{ width: 76 }}>
              <Text style={[meta, { color: p.inkMuted, marginBottom: space[2] }]}>{copy.forHours}</Text>
              <TextInput
                value={hours}
                onChangeText={setHours}
                onSubmitEditing={saveSleep}
                keyboardType="number-pad"
                style={[body, tabular, { color: p.ink, borderBottomWidth: 2, borderBottomColor: p.ink, paddingBottom: space[2] }]}
              />
            </View>
          </View>

          <Press
            onPress={saveSleep}
            accessibilityLabel={copy.setWindDown}
            style={{
              minHeight: 48,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: radius.pill,
              borderWidth: 2,
              borderColor: p.ink,
            }}
          >
            <Text style={[supporting, { color: p.ink }]}>
              {sleepSet ? copy.updateWindDown : copy.setWindDown}
            </Text>
          </Press>
        </ScrollView>
      </ContentColumn>
    </View>
  );
}
