import type { ReactNode } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Crow, DISPLAY, SYSTEM, type Palette } from './theme';
import { Phone } from './Phone';

const ease = (frame: number, from: number, dur = 14) =>
  interpolate(frame, [from, from + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

/** The app's enter: opacity + 8pt rise. Same vocabulary, on the timeline. */
const Rise = ({ frame, at, children }: { frame: number; at: number; children: ReactNode }) => {
  const t = ease(frame, at);
  return <div style={{ opacity: t, transform: `translateY(${(1 - t) * 8}px)` }}>{children}</div>;
};

const Pill = ({ pal, label }: { pal: Palette; label: string }) => (
  <div
    style={{
      height: 56,
      borderRadius: 999,
      background: pal.ink,
      color: pal.onInk,
      font: `600 17px ${SYSTEM}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {label}
  </div>
);

/** Scene 1 — capture. The crow tilts to attentive while text types in. */
export const Capture = ({ pal }: { pal: Palette }) => {
  const frame = useCurrentFrame();
  const full = 'ask about the boiler';
  const chars = Math.floor(
    interpolate(frame, [34, 74], [0, full.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const typing = frame > 30 && frame < 82;
  const held = frame > 86;

  return (
    <Phone pal={pal}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Crow
          size={44}
          ink={pal.ink}
          inkSecondary={pal.inkSecondary}
          paper={pal.paper}
          tilt={held ? 4 : typing ? -5 : 0}
        />
        <div style={{ display: 'flex', gap: 20, font: `400 15px ${SYSTEM}`, color: pal.inkMuted }}>
          <span>now</span>
          <span>places</span>
          <span>inbox</span>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 14,
        }}
      >
        <Rise frame={frame} at={6}>
          <div style={{ font: `700 52px/1 ${DISPLAY}`, letterSpacing: '-.025em', color: pal.ink }}>
            {'what is on your mind?'}
          </div>
        </Rise>
        <Rise frame={frame} at={14}>
          <div
            style={{
              font: `400 17px ${SYSTEM}`,
              color: held ? pal.accent : pal.inkSecondary,
            }}
          >
            {held ? 'Held.' : 'You are here.'}
          </div>
        </Rise>
      </div>

      <Rise frame={frame} at={22}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div
            style={{
              borderBottom: `2px solid ${pal.ink}`,
              paddingBottom: 12,
              font: `400 24px ${SYSTEM}`,
              color: chars > 0 && !held ? pal.ink : pal.inkMuted,
              minHeight: 34,
            }}
          >
            {held ? '' : chars > 0 ? full.slice(0, chars) : 'start typing'}
          </div>
          <Pill pal={pal} label="hold it" />
        </div>
      </Rise>
    </Phone>
  );
};

/** Scene 2 — the one card, swapping to a second offer mid-scene. */
export const Now = ({ pal }: { pal: Palette }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const second = frame > 58;
  const s = spring({ frame: frame - (second ? 58 : 0), fps, config: { damping: 200 } });

  return (
    <Phone pal={pal}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Crow size={44} ink={pal.ink} inkSecondary={pal.inkSecondary} paper={pal.paper} />
        <div style={{ font: `400 13px ${SYSTEM}`, color: pal.inkMuted }}>340 xp</div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ opacity: s, transform: `translateY(${(1 - s) * 8}px)` }}>
          <div style={{ font: `400 15px ${SYSTEM}`, color: pal.inkSecondary, marginBottom: 14 }}>
            one thing.
          </div>
          <div
            style={{
              font: `700 52px/1 ${DISPLAY}`,
              letterSpacing: '-.025em',
              color: pal.ink,
              marginBottom: 14,
            }}
          >
            {second ? 'message your brother' : 'call the landlord'}
          </div>
          <div style={{ font: `400 15px ${SYSTEM}`, color: pal.accent }}>
            {second ? '3 months' : 'you are here'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Pill pal={pal} label="do it" />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            font: `400 17px ${SYSTEM}`,
            color: pal.inkSecondary,
            padding: '0 8px',
          }}
        >
          <span>not now</span>
          <span>something else</span>
        </div>
      </div>
    </Phone>
  );
};

/** Scene 3 — rhythms. Tracks fill; they never drain. */
export const Rhythms = ({ pal }: { pal: Palette }) => {
  const frame = useCurrentFrame();
  const rows: Array<[string, number, number]> = [
    ['walk outside', 3, 5],
    ['call someone', 1, 2],
    ['cook properly', 2, 3],
  ];

  return (
    <Phone pal={pal}>
      <div style={{ font: `700 52px/1 ${DISPLAY}`, letterSpacing: '-.025em', color: pal.ink }}>
        rhythms
      </div>
      <div
        style={{
          font: `400 15px ${SYSTEM}`,
          color: pal.inkSecondary,
          marginTop: 12,
          marginBottom: 48,
        }}
      >
        Times per week, not every day.
      </div>

      {rows.map(([t, d, n], i) => {
        const grow = ease(frame, 12 + i * 10, 22);
        return (
          <div key={t} style={{ marginBottom: 34 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ font: `400 17px ${SYSTEM}`, color: pal.ink }}>{t}</span>
              <span style={{ font: `400 13px ${SYSTEM}`, color: pal.inkMuted }}>
                {d} of {n}
              </span>
            </div>
            <div style={{ height: 10, borderRadius: 999, background: pal.sunken, overflow: 'hidden' }}>
              <div
                style={{
                  height: 10,
                  width: `${(d / n) * 100 * grow}%`,
                  background: pal.ink,
                  borderRadius: 999,
                }}
              />
            </div>
          </div>
        );
      })}
    </Phone>
  );
};

/** Scene 4 — the closing mark. */
export const Mark = ({ pal }: { pal: Palette }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 200 } });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: pal.paper,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
      }}
    >
      <div style={{ opacity: s, transform: `scale(${0.94 + s * 0.06})` }}>
        <Crow size={220} ink={pal.ink} inkSecondary={pal.inkSecondary} paper={pal.paper} />
      </div>
      <div style={{ opacity: ease(frame, 16, 18), textAlign: 'center' }}>
        <div style={{ font: `700 64px/1 ${DISPLAY}`, letterSpacing: '-.03em', color: pal.ink }}>
          rudder
        </div>
        <div style={{ font: `400 22px ${SYSTEM}`, color: pal.inkSecondary, marginTop: 18 }}>
          one thing at a time
        </div>
      </div>
    </div>
  );
};
