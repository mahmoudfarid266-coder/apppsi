import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { ThemeProvider, useTheme } from '../src/ui/theme';
import { open } from '../src/db';

/**
 * DELIBERATELY THIN. Nothing here may block the capture route's first paint
 * (research R2). Database open, migrations, session restore, and sync all
 * initialise AFTER first paint, off the interaction path.
 *
 * If SC-001's cold-launch harness fails on the widget deep-link path, the cause
 * is almost certainly something added to this file.
 */
function Shell() {
  const { palette, name } = useTheme();

  useEffect(() => {
    // After first paint. Never awaited above the tree.
    void open();
  }, []);

  return (
    <>
      <StatusBar style={name === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.paper },
          animation: 'fade',
        }}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Shell />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
