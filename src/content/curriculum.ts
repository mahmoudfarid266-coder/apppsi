/**
 * Bundled curriculum. Offline, no network, no AI (Principle VIII).
 *
 * REGULATORY BOUNDARY (constitution, Security §): these are EXERCISES, never
 * therapy, treatment, or hypnotherapy. Nothing here diagnoses, and nothing
 * claims a physiological or clinical effect. Copy is written to stay on the
 * right side of that line — "try this", never "this will fix".
 *
 * Delivery rule: content arrives BECAUSE A MOMENT CALLED FOR IT. There is no
 * browsable course library — a courses tab is a graveyard.
 */

export type Trigger =
  | 'stuck' // can't start
  | 'spiralling' // catastrophising
  | 'stung' // rejection sensitivity
  | 'flat' // low mood, understimulated
  | 'wired' // overstimulated
  | 'alone' // solitude
  | 'winding_down';

export interface Exercise {
  id: string;
  trigger: Trigger;
  kind: 'cbt' | 'shadow' | 'granularity' | 'grounding' | 'wind_down';
  title: string;
  /** Short. Read in under 20 seconds. */
  body: string;
  minutes: number;
}

export const EXERCISES: Exercise[] = [
  // ---- task initiation (CBT-derived) ----
  {
    id: 'cbt-first-physical',
    trigger: 'stuck',
    kind: 'cbt',
    title: 'Name the first physical thing',
    body: "Not the task — the first movement. Not 'do taxes', but 'open the drawer'. Say it out loud, then do only that.",
    minutes: 2,
  },
  {
    id: 'cbt-two-minute',
    trigger: 'stuck',
    kind: 'cbt',
    title: 'Two minutes, then stop',
    body: "Give it two minutes with full permission to stop after. Starting is the hard part; stopping rarely happens.",
    minutes: 2,
  },
  {
    id: 'cbt-shrink',
    trigger: 'stuck',
    kind: 'cbt',
    title: 'Make it smaller until it is boring',
    body: "If it still feels heavy, it is still too big. Halve it. Halve it again. Stop when it sounds too small to matter.",
    minutes: 3,
  },
  // ---- catastrophising ----
  {
    id: 'cbt-evidence',
    trigger: 'spiralling',
    kind: 'cbt',
    title: 'What do you actually know?',
    body: "Write the thought. Then write only what you have evidence for. Notice the gap between them.",
    minutes: 5,
  },
  {
    id: 'cbt-worst-likely',
    trigger: 'spiralling',
    kind: 'cbt',
    title: 'Worst, best, likely',
    body: "Three lines: the worst case, the best case, and the one that has usually happened before. The third is the useful one.",
    minutes: 5,
  },
  // ---- rejection sensitivity ----
  {
    id: 'cbt-rsd-delay',
    trigger: 'stung',
    kind: 'cbt',
    title: 'Wait for the second reading',
    body: "The first reading of a message is the sting. Read it again in an hour. Do not reply before then.",
    minutes: 2,
  },
  {
    id: 'shadow-what-it-touched',
    trigger: 'stung',
    kind: 'shadow',
    title: 'What did that touch?',
    body: "The size of the reaction usually points at something older than the thing that caused it. What did it remind you of?",
    minutes: 8,
  },
  // ---- shadow work ----
  {
    id: 'shadow-avoiding',
    trigger: 'stuck',
    kind: 'shadow',
    title: 'What are you actually avoiding?',
    body: "It is rarely the task. It is usually a feeling the task would bring. Name the feeling and the task gets lighter.",
    minutes: 8,
  },
  {
    id: 'shadow-irritation',
    trigger: 'flat',
    kind: 'shadow',
    title: 'Who irritated you this week?',
    body: "What specifically did they do? Now ask honestly whether you ever do a version of it.",
    minutes: 10,
  },
  // ---- emotional granularity ----
  {
    id: 'gran-not-fine',
    trigger: 'flat',
    kind: 'granularity',
    title: "'Fine' is not a feeling",
    body: "Pick a sharper word: flat, restless, wired, hollow, resentful, wistful, relieved. Precision makes it smaller.",
    minutes: 3,
  },
  {
    id: 'gran-body-first',
    trigger: 'wired',
    kind: 'granularity',
    title: 'Where is it in your body?',
    body: "Jaw, chest, stomach, shoulders. Find it before you name it — the body usually knows first.",
    minutes: 3,
  },
  // ---- grounding ----
  {
    id: 'ground-54321',
    trigger: 'wired',
    kind: 'grounding',
    title: 'Five things you can see',
    body: "Five you can see. Four you can touch. Three you can hear. Two you can smell. One you can taste.",
    minutes: 4,
  },
  {
    id: 'ground-box',
    trigger: 'wired',
    kind: 'grounding',
    title: 'Box breathing',
    body: "In for four. Hold for four. Out for four. Hold for four. Six rounds.",
    minutes: 3,
  },
  {
    id: 'ground-cold',
    trigger: 'wired',
    kind: 'grounding',
    title: 'Cold water',
    body: "Cold water on your face and wrists for thirty seconds. It is the fastest physical reset available.",
    minutes: 1,
  },
  // ---- solitude ----
  {
    id: 'alone-notice',
    trigger: 'alone',
    kind: 'shadow',
    title: 'Is it lonely, or just quiet?',
    body: "They feel similar and are not the same. Sit with it for two minutes before deciding which one it is.",
    minutes: 4,
  },
  {
    id: 'alone-company',
    trigger: 'alone',
    kind: 'granularity',
    title: 'What would company actually fix?',
    body: "Sometimes the honest answer is nothing, and knowing that is a relief rather than a loss.",
    minutes: 5,
  },
  // ---- wind down ----
  {
    id: 'wind-park',
    trigger: 'winding_down',
    kind: 'wind_down',
    title: 'Park it in writing',
    body: "Anything still circling goes on paper. It will still be there tomorrow, and it stops needing you tonight.",
    minutes: 4,
  },
  {
    id: 'wind-body-scan',
    trigger: 'winding_down',
    kind: 'wind_down',
    title: 'Slow body scan',
    body: "Feet to head. Notice each part without changing it. If you lose your place, start again from the feet.",
    minutes: 10,
  },
];

export function forTrigger(t: Trigger): Exercise[] {
  return EXERCISES.filter((e) => e.trigger === t);
}

/**
 * Solo quests — escalating exposure. Being alone as a skill, not a consolation
 * prize. Progression is user-paced and never gated on a schedule.
 */
export interface SoloQuest {
  id: string;
  title: string;
  step: number;
  minutes: number;
  note: string;
}

export const SOLO_QUESTS: SoloQuest[] = [
  { id: 'solo-1', step: 1, minutes: 20, title: 'Coffee somewhere, alone', note: 'No phone on the table. Twenty minutes.' },
  { id: 'solo-2', step: 2, minutes: 30, title: 'Walk with no destination', note: 'Turn wherever looks better.' },
  { id: 'solo-3', step: 3, minutes: 60, title: 'Eat a meal out, alone', note: 'Sit in, not takeaway. Bring a book if you want.' },
  { id: 'solo-4', step: 4, minutes: 120, title: 'A film, alone', note: 'Pick the one nobody else would sit through.' },
  { id: 'solo-5', step: 5, minutes: 180, title: 'Somewhere you have never been', note: 'Same city is fine. New to you is the point.' },
  { id: 'solo-6', step: 6, minutes: 480, title: 'A day out, alone', note: 'Plan it like you would for someone you like.' },
];

/**
 * Self-maintenance — the things that collapse first and silently. Modelled as
 * rhythms so they get cadence rather than daily-binary tracking, and never
 * counted as failures.
 */
export const SELF_MAINTENANCE: Array<[string, number]> = [
  ['Shower', 7],
  ['Change the sheets', 1],
  ['Laundry', 1],
  ['Clear one surface', 3],
  ['Take the bins out', 1],
  ['Drink water properly', 7],
  ['Open a window', 5],
];
