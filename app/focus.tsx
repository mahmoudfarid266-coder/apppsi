import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { capture } from '../src/db';
import { endFocus, logBreak, noteDistraction, startFocus } from '../src/db/wellbeing';
import { ui } from '../src/ui/copy.catalogue';
import { Enter, Press, Swap } from '../src/ui/motion';
import { ContentColumn, Pill, TextAction } from '../src/ui/primitives';
import { usePalette, useSizeClass } from '../src/ui/theme';
import { radius, space } from '../src/ui/tokens';
import { body, hero, meta, supporting, tabular } from '../src/ui/type';

const DURATIONS = [10, 15, 25, 45, 90];
const RING = 52; // stroke width, per the component spec
const SIZE = 260;

/**
 * Focus — the disc is primary, numbers are subordinate (Principle III).
 *
 * BREAKS ARE FRICTION, NEVER LOCKOUT (Principle XIII):
 *  - The break is pre-selected and one tap.
 *  - Declining is possible and costs a deliberate press-and-hold.
 *  - It is NOT a watched countdown, carries no dissuading copy, and is
 *    never counted or surfaced later.
 *
 * The disc represents elapsed session time, not a depleting resource — that is
 * the one sanctioned exception to "progress fills, never drains".
 */
export default function Focus() {
  const p = usePalette();
  const size = useSizeClass();
  const insets = useSafeAreaInsets();

  const [minutes, setMinutes] = useState(25);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [thought, setThought] = useState('');
  const [captured, setCaptured] = useState(0);
  const [breakDue, setBreakDue] = useState(false);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (tick.current) clearInterval(tick.current);
    tick.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  const begin = async () => {
    const id = await startFocus(minutes);
    setSessionId(id);
    setRemaining(minutes * 60);
    setCaptured(0);
    stop();
    tick.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          stop();
          setBreakDue(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  };

  const finish = async () => {
    stop();
    if (sessionId) await endFocus(sessionId);
    setSessionId(null);
    setBreakDue(true);
  };

  const sendThought = () => {
    const t = thought.trim();
    if (!t) return;
    // Goes to the inbox WITHOUT ending the session (FR-4.8).
    capture(t, 'in_app');
    if (sessionId) void noteDistraction(sessionId);
    setThought('');
    setCaptured((c) => c + 1);
  };

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  const elapsed = sessionId ? 1 - remaining / (minutes * 60) : 0;

  const r = (SIZE - RING) / 2;
  const circ = 2 * Math.PI * r;

  /* ------------------------------------------------------- break prompt */
  if (breakDue) {
    return (
      <View style={{ flex: 1, backgroundColor: p.paper }}>
        <ContentColumn style={{ paddingTop: insets.top + space[5], paddingBottom: insets.bottom + space[5] }}>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Enter>
              <Text style={[hero(size), { color: p.ink, marginBottom: space[3] }]}>{ui.breakTitle}</Text>
              <Text style={[supporting, { color: p.inkSecondary }]}>{ui.breakBody}</Text>
            </Enter>
          </View>
          {/* Pre-selected and one tap. */}
          <Pill
            label={ui.takeIt}
            onPress={async () => {
              await logBreak('taken');
              setBreakDue(false);
            }}
          />
          {/* Declining costs a deliberate hold. No countdown to watch, no
              guilt copy, and it is never counted or shown later. */}
          <Press
            onLongPress={async () => {
              await logBreak('deferred');
              setBreakDue(false);
            }}
            delayLongPress={1500}
            accessibilityLabel={ui.holdToKeepWorking}
            style={{ minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: space[3] }}
          >
            <Text style={[supporting, { color: p.inkMuted }]}>{ui.holdToKeepWorking}</Text>
          </Press>
        </ContentColumn>
      </View>
    );
  }

  /* -------------------------------------------------------------- idle */
  if (!sessionId) {
    return (
      <View style={{ flex: 1, backgroundColor: p.paper }}>
        <ContentColumn style={{ paddingTop: insets.top + space[4], paddingBottom: insets.bottom + space[5] }}>
          <TextAction label={ui.back} onPress={() => router.back()} />
          <Text style={[hero(size), { color: p.ink, marginTop: space[4] }]}>focus</Text>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Text style={[meta, { color: p.inkMuted, marginBottom: space[3] }]}>{ui.howLong}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {DURATIONS.map((d) => (
                <Press
                  key={d}
                  onPress={() => setMinutes(d)}
                  accessibilityLabel={`${d} minutes`}
                  style={{
                    minHeight: 48,
                    justifyContent: 'center',
                    paddingHorizontal: space[5],
                    marginRight: space[2],
                    marginBottom: space[2],
                    borderRadius: radius.pill,
                    backgroundColor: minutes === d ? p.accent : p.sunken,
                  }}
                >
                  <Text
                    style={[
                      supporting,
                      tabular,
                      { color: minutes === d ? p.onAccent : p.ink, fontWeight: minutes === d ? '600' : '400' },
                    ]}
                  >
                    {d}
                  </Text>
                </Press>
              ))}
            </View>
          </View>
          <Pill label={ui.startFocus} onPress={begin} />
        </ContentColumn>
      </View>
    );
  }

  /* ----------------------------------------------------------- running */
  return (
    <View style={{ flex: 1, backgroundColor: p.paper }}>
      <ContentColumn style={{ paddingTop: insets.top + space[4], paddingBottom: insets.bottom + space[5] }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={SIZE} height={SIZE}>
            <Circle cx={SIZE / 2} cy={SIZE / 2} r={r} stroke={p.sunken} strokeWidth={RING} fill="none" />
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={r}
              stroke={p.ink}
              strokeWidth={RING}
              fill="none"
              strokeLinecap="butt"
              strokeDasharray={`${circ}`}
              strokeDashoffset={circ * (1 - elapsed)}
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            />
          </Svg>
          {/* Numbers subordinate: 20pt, tabular, beneath the disc. */}
          <Text style={[body, tabular, { color: p.inkSecondary, fontSize: 20, marginTop: space[5] }]}>
            {mm}:{ss} {ui.left}
          </Text>
          {captured > 0 && (
            <Swap swapKey={`c${captured}`}>
              <Text style={[meta, tabular, { color: p.inkMuted, marginTop: space[2] }]}>
                {captured} {ui.setAside}
              </Text>
            </Swap>
          )}
        </View>

        {/* Always visible. Sends a thought to the inbox without ending the session. */}
        <TextInput
          value={thought}
          onChangeText={setThought}
          onSubmitEditing={sendThought}
          placeholder={ui.intrudingThought}
          placeholderTextColor={p.inkMuted}
          returnKeyType="done"
          style={[
            body,
            {
              color: p.ink,
              borderBottomWidth: 2,
              borderBottomColor: p.ink,
              paddingBottom: space[2],
              marginBottom: space[5],
            },
          ]}
        />
        <Pill label={ui.doneFocus} onPress={finish} />
      </ContentColumn>
    </View>
  );
}
