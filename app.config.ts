import type { ExpoConfig } from 'expo/config';

// Bundle identifier must be globally unique. Change the middle segment before the
// first EAS build — `com.rudder.app` is almost certainly taken.
const BUNDLE_ID = 'com.rudder.capture';

const config: ExpoConfig = {
  name: 'Rudder',
  slug: 'rudder',
  version: '0.1.0',
  scheme: 'rudder', // rudder://capture, rudder://inbox — contracts/app-entry-points.md
  orientation: 'default', // all four orientations — design-system §3b
  userInterfaceStyle: 'automatic', // follows the system, no theme question at onboarding
  // New Architecture is the default in SDK 57 — no flag needed.

  ios: {
    bundleIdentifier: BUNDLE_ID,
    supportsTablet: true,
    // false = Split View and Slide Over are allowed. The reference device
    // (iPad Air 4, A14) supports both but NOT Stage Manager, which is M1+.
    requireFullScreen: false,
    config: { usesNonExemptEncryption: false },
    infoPlist: {
      // Capture must work with every permission denied (FR-033). These strings
      // exist so the prompt is honest when the user does opt in.
      NSMicrophoneUsageDescription:
        'Used only to record a voice capture on this device. Audio stays on your device.',
      NSSpeechRecognitionUsageDescription:
        'Used only to turn a voice capture into text on this device.',
      // Location: foreground only, and framed by what it does (FR-033).
      // Precise coordinates never leave the device (Principle XII), so there is
      // deliberately NO "Always" permission request and no background mode.
      NSLocationWhenInUseUsageDescription:
        'Used to remember what you wanted to do near places you go. Your locations stay on this device and are never shared.',
      UISupportedInterfaceOrientations: [
        'UIInterfaceOrientationPortrait',
        'UIInterfaceOrientationPortraitUpsideDown',
        'UIInterfaceOrientationLandscapeLeft',
        'UIInterfaceOrientationLandscapeRight',
      ],
    },
  },

  plugins: [
    'expo-router',
    'expo-sqlite',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#FDF4EC',
        dark: { backgroundColor: '#24050F' },
        resizeMode: 'contain',
      },
    ],
  ],

  experiments: { typedRoutes: true },
};

export default config;
