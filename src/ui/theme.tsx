import { createContext, useContext, type ReactNode } from 'react';
import { useColorScheme, useWindowDimensions, AccessibilityInfo } from 'react-native';
import { useEffect, useState } from 'react';
import { palettes, duration, type Palette, type ThemeName } from './tokens';

/* ------------------------------------------------------------------ theme */

const ThemeContext = createContext<{ palette: Palette; name: ThemeName }>({
  palette: palettes.light,
  name: 'light',
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Follows the system. No theme question at onboarding (Principle V).
  const scheme = useColorScheme();
  const name: ThemeName = scheme === 'dark' ? 'dark' : 'light';
  return (
    <ThemeContext.Provider value={{ palette: palettes[name], name }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
export const usePalette = () => useContext(ThemeContext).palette;

/* ------------------------------------------------------------- size class */

export type SizeClass = 'compact' | 'narrow' | 'medium' | 'wide' | 'widest';

/**
 * Resolved from window width, not device model — Split View and Slide Over
 * change the width without changing the device. design-system §3b.
 */
export function useSizeClass(): SizeClass {
  const { width } = useWindowDimensions();
  if (width < 350) return 'compact'; // Slide Over ~320
  if (width < 500) return 'narrow'; // Split View 1/3 ~375
  if (width < 700) return 'medium'; // Split View 1/2 ~590
  if (width < 1000) return 'wide'; // full screen portrait 820
  return 'widest'; // full screen landscape 1180
}

/* ----------------------------------------------------------------- motion */

/**
 * Reduce Motion resolves EVERY duration to 0ms. Not reduced — zero.
 * Constitution Principle VII, marked CRITICAL.
 */
export function useMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => alive && setReduced(v));
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);

  if (reduced) {
    return { instant: 0, micro: 0, enter: 0, exit: 0, reduced: true } as const;
  }
  return { ...duration, reduced: false } as const;
}
