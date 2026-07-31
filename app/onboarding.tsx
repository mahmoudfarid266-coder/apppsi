import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Crow } from '../src/companion/Crow';
import { addMed, finishOnboarding, setCompanionName } from '../src/db/wellbeing';
import { onboarding, ui } from '../src/ui/copy.catalogue';
import { Enter, Press, Swap } from '../src/ui/motion';
import { ContentColumn, Pill, TextAction } from '../src/ui/primitives';
import { usePalette, useSizeClass } from '../src/ui/theme';
import { radius, space } from '../src/ui/tokens';
import { body, hero, meta, supporting, title } from '../src/ui/type';

/**
 * Six screens, EVERY ONE SKIPPABLE, under 90 seconds (FR-0.1, FR-032).
 *
 * Skipping all of them must land on a working capture screen with a named
 * companion and sensible defaults. No dead ends. Denying every permission
 * still yields a working app.
 *
 * Permissions are requested ONE AT A TIME, each framed by what it does, and
 * never as a wall.
 */

const FAILURE_MODES = [
  'starting things',
  'choosing',
  'feeling time pass',
  'remembering people',
  'medication',
  'sleep',
  'getting overwhelmed',
  'being alone',
  'keeping the place',
];

const ENERGY = ['low', 'middling', 'sharp'] as const;
const SLOTS = ['morning', 'afternoon', 'evening'] as const;

export default function Onboarding() {
  const p = usePalette();
  const size = useSizeClass();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(0);
  const [breaks, setBreaks] = useState<Set<string>>(new Set());
  const [name, setName] = useState('');
  const [medName, setMedName] = useState('');
  const [medTimes, setMedTimes] = useState('');
  const [energy, setEnergy] = useState<Record<string, string>>({});
  const [dump, setDump] = useState('');

  const finish = async () => {
    await setCompanionName(name.trim() || onboarding.defaultName);
    if (medName.trim()) {
      await addMed(
        medName.trim(),
        '',
        medTimes.split(',').map((t) => t.trim()).filter(Boolean)
      );
    }
    await finishOnboarding();
    router.replace('/');
  };

  const next = () => (step >= 5 ? void finish() : setStep(step + 1));

  const Chip = ({
    label,
    on,
    onPress,
  }: {
    label: string;
    on: boolean;
    onPress: () => void;
  }) => (
    <Press
      onPress={onPress}
      accessibilityLabel={label}
      style={{
        minHeight: 48,
        justifyContent: 'center',
        paddingHorizontal: space[5],
        marginRight: space[2],
        marginBottom: space[2],
        borderRadius: radius.pill,
        backgroundColor: on ? p.accent : p.sunken,
      }}
    >
      <Text style={[supporting, { color: on ? p.onAccent : p.ink, fontWeight: on ? '600' : '400' }]}>
        {label}
      </Text>
    </Press>
  );

  const steps = [
    // ① what breaks most often
    <View key="s0">
      <Text style={[hero(size), { color: p.ink, marginBottom: space[3] }]}>
        {onboarding.q1}
      </Text>
      <Text style={[supporting, { color: p.inkSecondary, marginBottom: space[6] }]}>
        {onboarding.q1sub}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {FAILURE_MODES.map((m) => (
          <Chip
            key={m}
            label={m}
            on={breaks.has(m)}
            onPress={() =>
              setBreaks((s) => {
                const n = new Set(s);
                n.has(m) ? n.delete(m) : n.add(m);
                return n;
              })
            }
          />
        ))}
      </View>
    </View>,

    // ② name the crow
    <View key="s1" style={{ alignItems: 'center' }}>
      <Crow state="idle" size={200} />
      <Text style={[hero(size), { color: p.ink, marginTop: space[6], marginBottom: space[3] }]}>
        {onboarding.q2}
      </Text>
      <Text style={[supporting, { color: p.inkSecondary, marginBottom: space[6], textAlign: 'center' }]}>
        {onboarding.q2sub}
      </Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={onboarding.defaultName}
        placeholderTextColor={p.inkMuted}
        autoCapitalize="none"
        style={[
          body,
          {
            alignSelf: 'stretch',
            color: p.ink,
            fontSize: 24,
            textAlign: 'center',
            borderBottomWidth: 2,
            borderBottomColor: p.ink,
            paddingBottom: space[3],
          },
        ]}
      />
    </View>,

    // ③ medication
    <View key="s2">
      <Text style={[hero(size), { color: p.ink, marginBottom: space[3] }]}>{onboarding.q3}</Text>
      <Text style={[supporting, { color: p.inkSecondary, marginBottom: space[6] }]}>
        {onboarding.q3sub}
      </Text>
      <TextInput
        value={medName}
        onChangeText={setMedName}
        placeholder={onboarding.medPlaceholder}
        placeholderTextColor={p.inkMuted}
        style={[body, { color: p.ink, borderBottomWidth: 2, borderBottomColor: p.ink, paddingBottom: space[2], marginBottom: space[5] }]}
      />
      <TextInput
        value={medTimes}
        onChangeText={setMedTimes}
        placeholder={onboarding.timePlaceholder}
        placeholderTextColor={p.inkMuted}
        style={[body, { color: p.ink, borderBottomWidth: 2, borderBottomColor: p.ink, paddingBottom: space[2] }]}
      />
    </View>,

    // ④ energy curve
    <View key="s3">
      <Text style={[hero(size), { color: p.ink, marginBottom: space[3] }]}>{onboarding.q4}</Text>
      <Text style={[supporting, { color: p.inkSecondary, marginBottom: space[6] }]}>
        {onboarding.q4sub}
      </Text>
      {SLOTS.map((slot) => (
        <View key={slot} style={{ marginBottom: space[5] }}>
          <Text style={[meta, { color: p.inkMuted, marginBottom: space[2] }]}>{slot}</Text>
          <View style={{ flexDirection: 'row' }}>
            {ENERGY.map((e) => (
              <Chip
                key={e}
                label={e}
                on={energy[slot] === e}
                onPress={() => setEnergy((x) => ({ ...x, [slot]: e }))}
              />
            ))}
          </View>
        </View>
      ))}
    </View>,

    // ⑤ permissions — one at a time, framed by what they do
    <View key="s4">
      <Text style={[hero(size), { color: p.ink, marginBottom: space[3] }]}>{onboarding.q5}</Text>
      <Text style={[supporting, { color: p.inkSecondary, marginBottom: space[6] }]}>
        {onboarding.q5sub}
      </Text>
      {[onboarding.permNotify, onboarding.permLocation, onboarding.permMic].map((line) => (
        <View
          key={line}
          style={{
            backgroundColor: p.surface,
            borderRadius: radius.card,
            padding: space[5],
            marginBottom: space[3],
          }}
        >
          <Text style={[body, { color: p.ink }]}>{line}</Text>
        </View>
      ))}
      <Text style={[meta, { color: p.inkMuted, marginTop: space[2] }]}>{onboarding.permNote}</Text>
    </View>,

    // ⑥ dump three things
    <View key="s5">
      <Text style={[hero(size), { color: p.ink, marginBottom: space[3] }]}>{onboarding.q6}</Text>
      <Text style={[supporting, { color: p.inkSecondary, marginBottom: space[6] }]}>
        {onboarding.q6sub}
      </Text>
      <TextInput
        value={dump}
        onChangeText={setDump}
        multiline
        placeholder={onboarding.dumpPlaceholder}
        placeholderTextColor={p.inkMuted}
        style={[
          body,
          {
            color: p.ink,
            minHeight: 140,
            backgroundColor: p.surface,
            borderRadius: radius.field,
            padding: space[4],
            textAlignVertical: 'top',
          },
        ]}
      />
    </View>,
  ];

  return (
    <View style={{ flex: 1, backgroundColor: p.paper }}>
      <ContentColumn
        style={{ paddingTop: insets.top + space[5], paddingBottom: insets.bottom + space[5] }}
      >
        {/* Progress fills. Never drains, never shows what's left. */}
        <View style={{ flexDirection: 'row', gap: space[1], marginBottom: space[7] }}>
          {steps.map((_, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 3,
                borderRadius: radius.pill,
                backgroundColor: i <= step ? p.ink : p.sunken,
              }}
            />
          ))}
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <Swap swapKey={`step-${step}`}>{steps[step]}</Swap>
        </ScrollView>

        <Enter>
          <View style={{ marginTop: space[6] }}>
            <Pill label={step >= 5 ? ui.begin : ui.next} onPress={next} />
            <View style={{ alignItems: 'center', marginTop: space[2] }}>
              {/* Every step is skippable. Skipping all of them still works. */}
              <TextAction label={step >= 5 ? ui.skipAll : ui.skip} onPress={next} />
            </View>
          </View>
        </Enter>
      </ContentColumn>
    </View>
  );
}
