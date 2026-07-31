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
  storageFull:
    "This device is out of space, so that couldn't be saved. Free some space and try again.",
} as const;

/** Deterministic per session so the greeting does not flicker on re-render. */
export function pick<T extends readonly string[]>(options: T, seed: number): T[number] {
  return options[seed % options.length];
}
