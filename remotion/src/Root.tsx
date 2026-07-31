import { AbsoluteFill, Composition, Sequence, useCurrentFrame, interpolate } from 'remotion';
import { Capture, Mark, Now, Rhythms } from './scenes';
import { light, type Palette } from './theme';

const FPS = 30;
const S = (n: number) => n * FPS;

/** Scene lengths, in seconds. Total 22s. */
const TIMELINE = [
  { comp: Capture, from: 0, dur: 4.5 },
  { comp: Now, from: 4.5, dur: 5.5 },
  { comp: Rhythms, from: 10, dur: 4 },
  { comp: Mark, from: 14, dur: 4 },
] as const;

/**
 * Scenes cross-fade rather than cut. Same restraint as the app: opacity only,
 * nothing decorative, nothing that would look frantic.
 */
const Stage = ({ pal }: { pal: Palette }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: pal.paper, alignItems: 'center', justifyContent: 'center' }}>
      {TIMELINE.map(({ comp: Comp, from, dur }, i) => {
        const start = S(from);
        const end = S(from + dur);
        const opacity = interpolate(
          frame,
          [start - 8, start + 8, end - 8, end + 8],
          [0, 1, 1, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        if (frame < start - 10 || frame > end + 10) return null;
        return (
          <AbsoluteFill
            key={i}
            style={{
              opacity,
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'scale(1.318)',
            }}
          >
            <Sequence from={start} durationInFrames={S(dur) + 20} layout="none">
              <Comp pal={pal} />
            </Sequence>
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

export const RemotionRoot = () => (
  <>
    <Composition
      id="RudderPromo"
      component={Stage}
      durationInFrames={S(18)}
      fps={FPS}
      width={1080}
      height={1556}
      defaultProps={{ pal: light }}
    />
    <Composition
      id="RudderPromoLandscape"
      component={Stage}
      durationInFrames={S(18)}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={{ pal: light }}
    />
  </>
);
