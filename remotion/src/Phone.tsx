import type { ReactNode } from 'react';
import type { Palette } from './theme';

/** iPad-proportioned frame. The app is iPad-primary, so the promo shows that. */
export const Phone = ({
  pal,
  children,
}: {
  pal: Palette;
  children: ReactNode;
}) => (
  <div
    style={{
      width: 820,
      height: 1180,
      background: pal.paper,
      borderRadius: 44,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 24px 80px rgba(69,9,32,.18)',
    }}
  >
    {/* 620pt centred column — the app's most important layout rule */}
    <div
      style={{
        width: 620,
        margin: '0 auto',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '64px 0',
      }}
    >
      {children}
    </div>
  </div>
);
