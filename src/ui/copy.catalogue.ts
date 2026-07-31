/**
 * THE COPY CATALOGUE.
 *
 * Every user-facing string in the product lives here and nowhere else.
 * `scripts/lint-copy.ts` fails the build on:
 *   1. any string here matching the banned-pattern list, and
 *   2. any user-facing string literal found outside this file.
 *
 * The companion's full vocabulary is 12 strings — small enough to audit
 * exhaustively rather than sample. That is the point of FR-026b.
 *
 * Banned, per contracts/companion-voice.md:
 *   money · shame/failure · manufactured urgency (incl. "!") ·
 *   counts of things not done · references to absence
 */

export const companion = {
  arrive: ["You're here.", 'Hello again.'] as const,
  held: ['Got it.', 'Held.', "That's safe now.", 'Noted.'] as const,
  empty: 'Nothing needs you right now.',
  merged: "Everything you'd already written is in your account now.",
} as const;

/** Plain replacements when personality is off (FR-025). Not a degraded path. */
export const plain = {
  arrive: null,
  held: 'Saved',
  empty: 'No items',
  merged: 'Local items added to your account',
} as const;

export const onboarding = {
  defaultName: 'crow',
  q1: 'what breaks most often?',
  q1sub: 'Pick any. It only sets a starting point.',
  q2: 'name the crow',
  q2sub: 'It will be around a lot.',
  q3: 'medication?',
  q3sub: 'A reminder and a log. Never a dose.',
  medPlaceholder: 'what you take',
  timePlaceholder: 'times, comma separated',
  q4: 'when are you sharp?',
  q4sub: 'Roughly. It adjusts as it learns.',
  q5: 'a few permissions',
  q5sub: 'Each one, only when it earns it.',
  permNotify: 'Notifications, capped at six a day, so it can tell you when to leave.',
  permLocation: 'Location, so it remembers what you wanted to do near places you go. It stays on this device.',
  permMic: 'Microphone, only for a voice capture. Audio stays on this device.',
  permNote: 'Everything works with all of these turned off.',
  q6: 'what is on your mind?',
  q6sub: 'Three things. They become your first items.',
  dumpPlaceholder: 'one per line',
} as const;

export const ui = {
  capturePrompt: "What's on your mind?",
  capturePlaceholder: 'Anything at all',
  captureHint: 'No fields. Return keeps going.',
  holdIt: 'Hold it',
  inboxTitle: 'Inbox',
  unreadSuffix: 'unread',
  openInbox: 'Inbox',
  openMap: 'Places',
  openNow: 'Now',
  openCapture: 'Capture',
  openRhythms: 'Rhythms',
  openPeople: 'People',
  openReset: 'Reset',
  stillBeHere: 'It will still be here.',
  back: 'Back',
  useLocation: 'Use my location',
  rememberPlace: 'Remember this place',
  somethingElse: 'Something else',
  notNow: 'Not now',
  doIt: 'Do it',
  addToMenu: 'Add to the menu',
  addRhythm: 'Add a rhythm',
  addSomeone: 'Add someone',
  keepIt: 'Keep it',
  next: 'Next',
  skip: 'Skip',
  skipAll: 'Skip the rest',
  begin: 'Begin',
  howLong: 'How long?',
  startFocus: 'Start',
  doneFocus: 'Done',
  left: 'left',
  setAside: 'set aside',
  intrudingThought: 'something else on your mind?',
  breakTitle: 'Time to stop for a bit.',
  breakBody: 'Stand up, look at something far away, drink water.',
  takeIt: 'Take it',
  holdToKeepWorking: 'hold to keep working',
  openFocus: 'Focus',
  openCare: 'Care',
  openSolitude: 'Solitude',
  deletePermanently: 'delete permanently?',
  deleteBody: "This one can't come back. Everything else is recoverable for 30 days.",
  deleteAction: 'Delete',
  addBasics: 'Add the basics',
  basicsHint: 'Shower, sheets, laundry, one surface, bins, water, a window.',
  storageFull:
    "This device is out of space, so that couldn't be saved. Free some space and try again.",
} as const;

/** Deterministic per session so the greeting does not flicker on re-render. */
export function pick<T extends readonly string[]>(options: T, seed: number): T[number] {
  return options[seed % options.length];
}
