import { uuidv7 } from 'uuidv7';
import { getDb } from './index';

/**
 * Data layer for the remaining systems: Rhythms, Regulation, Bonds, Record.
 *
 * Constitutional constraints baked in here rather than left to UI discipline:
 *  - Habits use CADENCE, not daily-binary. No `streak` column exists anywhere;
 *    streaks are computed, so no write path can break one (Principle IV).
 *  - Counters are append-only event rows, never mutable integers (Principle VI).
 *  - No table stores a count of things NOT done (FR-031).
 *  - `people` has no `last_contacted_at` — it is derived from interactions, so
 *    a two-device edit cannot silently reset a relationship's drift.
 */

export const SCHEMA_SYSTEMS = `
-- ---------------------------------------------------------------- Rhythms
CREATE TABLE IF NOT EXISTS habits (
  id           TEXT PRIMARY KEY NOT NULL,
  title        TEXT NOT NULL,
  target_count INTEGER NOT NULL DEFAULT 1,
  period       TEXT NOT NULL DEFAULT 'week',
  active       INTEGER NOT NULL DEFAULT 1,
  created_at   INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS habit_events (
  id          TEXT PRIMARY KEY NOT NULL,
  habit_id    TEXT NOT NULL,
  occurred_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS medications (
  id        TEXT PRIMARY KEY NOT NULL,
  name      TEXT NOT NULL,
  dose_text TEXT,
  times     TEXT NOT NULL,          -- comma-separated HH:MM, user's own text
  active    INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS med_events (
  id          TEXT PRIMARY KEY NOT NULL,
  med_id      TEXT NOT NULL,
  state       TEXT NOT NULL,        -- taken | skipped | late
  occurred_at INTEGER NOT NULL
);

-- -------------------------------------------------------------- Regulation
CREATE TABLE IF NOT EXISTS menu_items (
  id       TEXT PRIMARY KEY NOT NULL,
  label    TEXT NOT NULL,
  course   TEXT NOT NULL,           -- starter|main|side|dessert|special
  minutes  INTEGER,
  effort   TEXT NOT NULL DEFAULT 'low'
);
CREATE TABLE IF NOT EXISTS state_declarations (
  id         TEXT PRIMARY KEY NOT NULL,
  state      TEXT NOT NULL,         -- overstimulated | understimulated | wind_down
  started_at INTEGER NOT NULL,
  ended_at   INTEGER
);
CREATE TABLE IF NOT EXISTS check_ins (
  id         TEXT PRIMARY KEY NOT NULL,
  energy     INTEGER NOT NULL,
  mood       INTEGER NOT NULL,
  focus      INTEGER NOT NULL,
  note       TEXT,
  created_at INTEGER NOT NULL
);

-- ------------------------------------------------------------------- Bonds
CREATE TABLE IF NOT EXISTS tiers (
  id           TEXT PRIMARY KEY NOT NULL,
  label        TEXT NOT NULL,
  cadence_days INTEGER NOT NULL,
  sort_order   INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS people (
  id            TEXT PRIMARY KEY NOT NULL,
  tier_id       TEXT REFERENCES tiers(id) ON DELETE SET NULL,
  display_name  TEXT NOT NULL,
  cadence_override INTEGER,
  last_topic    TEXT,
  created_at    INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS interactions (
  id          TEXT PRIMARY KEY NOT NULL,
  person_id   TEXT NOT NULL,
  kind        TEXT NOT NULL,        -- message | call | hangout | other
  occurred_at INTEGER NOT NULL,
  note        TEXT
);

-- ------------------------------------------------------------------ Record
CREATE TABLE IF NOT EXISTS journal_entries (
  id         TEXT PRIMARY KEY NOT NULL,
  body       TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

-- Append-only. Balance is a SUM, never a stored integer, and never decreases.
CREATE TABLE IF NOT EXISTS currency_events (
  id          TEXT PRIMARY KEY NOT NULL,
  amount      INTEGER NOT NULL,
  reason      TEXT NOT NULL,
  occurred_at INTEGER NOT NULL
);
`;

/** Your tiers, verbatim from the brainstorm. 'myself' is a real tier. */
export const DEFAULT_TIERS: Array<[string, number, number]> = [
  ['myself', 1, 0],
  ['relationship', 1, 1],
  ['family', 7, 2],
  ['bff', 7, 3],
  ['close friends', 14, 4],
  ['rizz', 3, 5],
  ['hangout', 30, 6],
  ['coworker', 90, 7],
  ['bizz', 90, 8],
];

const STARTER_MENU: Array<[string, string, number, string]> = [
  ['Step outside for two minutes', 'starter', 2, 'low'],
  ['Cold water on your face', 'starter', 1, 'low'],
  ['Put on one song you love', 'starter', 4, 'low'],
  ['Lie on the floor', 'starter', 4, 'low'],
  ['Walk around the block', 'main', 15, 'medium'],
  ['Make something with your hands', 'main', 30, 'medium'],
  ['Call someone who makes you laugh', 'main', 20, 'medium'],
  ['Stretch on the floor', 'side', 5, 'low'],
  ['Tea, made properly', 'side', 6, 'low'],
  ['Scroll', 'dessert', 15, 'low'],
  ['A day out somewhere new', 'special', 240, 'high'],
];

export async function seedDefaults(): Promise<void> {
  const db = await getDb();
  const t = await db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) n FROM tiers`);
  if ((t?.n ?? 0) === 0) {
    for (const [label, days, order] of DEFAULT_TIERS) {
      await db.runAsync(
        `INSERT INTO tiers (id,label,cadence_days,sort_order) VALUES (?,?,?,?)`,
        [uuidv7(), label, days, order]
      );
    }
  }
  const m = await db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) n FROM menu_items`);
  if ((m?.n ?? 0) === 0) {
    for (const [label, course, minutes, effort] of STARTER_MENU) {
      await db.runAsync(
        `INSERT INTO menu_items (id,label,course,minutes,effort) VALUES (?,?,?,?,?)`,
        [uuidv7(), label, course, minutes, effort]
      );
    }
  }
}

/* ----------------------------------------------------------------- Rhythms */

export interface Habit {
  id: string;
  title: string;
  targetCount: number;
  period: string;
  /** DERIVED — never stored. */
  doneThisPeriod: number;
}

function periodStart(period: string): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (period === 'week') d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  if (period === 'month') d.setDate(1);
  return d.getTime();
}

export async function listHabits(): Promise<Habit[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: string;
    title: string;
    target_count: number;
    period: string;
  }>(`SELECT * FROM habits WHERE active = 1 ORDER BY title`);
  const out: Habit[] = [];
  for (const r of rows) {
    const since = periodStart(r.period);
    const c = await db.getFirstAsync<{ n: number }>(
      `SELECT COUNT(*) n FROM habit_events WHERE habit_id = ? AND occurred_at >= ?`,
      [r.id, since]
    );
    out.push({
      id: r.id,
      title: r.title,
      targetCount: r.target_count,
      period: r.period,
      doneThisPeriod: c?.n ?? 0,
    });
  }
  return out;
}

export async function addHabit(title: string, targetCount = 1, period = 'week') {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO habits (id,title,target_count,period,active,created_at) VALUES (?,?,?,?,1,?)`,
    [uuidv7(), title, targetCount, period, Date.now()]
  );
}

export async function markHabit(habitId: string) {
  const db = await getDb();
  await db.runAsync(`INSERT INTO habit_events (id,habit_id,occurred_at) VALUES (?,?,?)`, [
    uuidv7(),
    habitId,
    Date.now(),
  ]);
  await earn(2, 'habit');
}

/* -------------------------------------------------------------- Regulation */

export interface MenuItem {
  id: string;
  label: string;
  course: string;
  minutes: number | null;
  effort: string;
}

export async function listMenu(course?: string): Promise<MenuItem[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<MenuItem & { minutes: number | null }>(
    course
      ? `SELECT * FROM menu_items WHERE course = ? ORDER BY label`
      : `SELECT * FROM menu_items ORDER BY course, label`,
    course ? [course] : []
  );
  return rows;
}

export async function addMenuItem(label: string, course: string, minutes: number | null) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO menu_items (id,label,course,minutes,effort) VALUES (?,?,?,?,'low')`,
    [uuidv7(), label, course, minutes]
  );
}

export async function declareState(state: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE state_declarations SET ended_at = ? WHERE ended_at IS NULL`,
    [Date.now()]
  );
  if (state !== 'clear') {
    await db.runAsync(
      `INSERT INTO state_declarations (id,state,started_at,ended_at) VALUES (?,?,?,NULL)`,
      [uuidv7(), state, Date.now()]
    );
  }
}

export async function currentState(): Promise<string | null> {
  const db = await getDb();
  const r = await db.getFirstAsync<{ state: string }>(
    `SELECT state FROM state_declarations WHERE ended_at IS NULL ORDER BY started_at DESC LIMIT 1`
  );
  return r?.state ?? null;
}

export async function addCheckIn(energy: number, mood: number, focus: number, note?: string) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO check_ins (id,energy,mood,focus,note,created_at) VALUES (?,?,?,?,?,?)`,
    [uuidv7(), energy, mood, focus, note ?? null, Date.now()]
  );
}

export async function latestCheckIn() {
  const db = await getDb();
  return db.getFirstAsync<{ energy: number; mood: number; focus: number; created_at: number }>(
    `SELECT energy,mood,focus,created_at FROM check_ins ORDER BY created_at DESC LIMIT 1`
  );
}

/* ------------------------------------------------------------------- Bonds */

export interface Person {
  id: string;
  displayName: string;
  tierLabel: string;
  cadenceDays: number;
  lastTopic: string | null;
  /** DERIVED from interactions. */
  lastContactAt: number | null;
  daysSince: number | null;
  drift: number;
}

export async function listTiers() {
  const db = await getDb();
  return db.getAllAsync<{ id: string; label: string; cadence_days: number }>(
    `SELECT id,label,cadence_days FROM tiers ORDER BY sort_order`
  );
}

export async function addPerson(name: string, tierId: string) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO people (id,tier_id,display_name,created_at) VALUES (?,?,?,?)`,
    [uuidv7(), tierId, name, Date.now()]
  );
}

export async function listPeople(): Promise<Person[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: string;
    display_name: string;
    last_topic: string | null;
    cadence_override: number | null;
    label: string | null;
    cadence_days: number | null;
    last_at: number | null;
  }>(`
    SELECT p.id, p.display_name, p.last_topic, p.cadence_override,
           t.label, t.cadence_days,
           (SELECT MAX(occurred_at) FROM interactions i WHERE i.person_id = p.id) AS last_at
    FROM people p LEFT JOIN tiers t ON t.id = p.tier_id
  `);
  const now = Date.now();
  return rows
    .map((r) => {
      const cadence = r.cadence_override ?? r.cadence_days ?? 30;
      const daysSince = r.last_at ? Math.floor((now - r.last_at) / 86_400_000) : null;
      return {
        id: r.id,
        displayName: r.display_name,
        tierLabel: r.label ?? '—',
        cadenceDays: cadence,
        lastTopic: r.last_topic,
        lastContactAt: r.last_at,
        daysSince,
        drift: daysSince === null ? 1 : daysSince / cadence,
      };
    })
    .sort((a, b) => b.drift - a.drift);
}

export async function logInteraction(personId: string, kind: string, note?: string) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO interactions (id,person_id,kind,occurred_at,note) VALUES (?,?,?,?,?)`,
    [uuidv7(), personId, kind, Date.now(), note ?? null]
  );
  if (note) await db.runAsync(`UPDATE people SET last_topic = ? WHERE id = ?`, [note, personId]);
  await earn(3, 'bond');
}

/* ------------------------------------------------------------------ Record */

export async function addJournal(body: string) {
  const db = await getDb();
  await db.runAsync(`INSERT INTO journal_entries (id,body,created_at) VALUES (?,?,?)`, [
    uuidv7(),
    body,
    Date.now(),
  ]);
  await earn(2, 'journal');
}

export async function listJournal(limit = 50) {
  const db = await getDb();
  return db.getAllAsync<{ id: string; body: string; created_at: number }>(
    `SELECT * FROM journal_entries ORDER BY created_at DESC LIMIT ?`,
    [limit]
  );
}

/* ---------------------------------------------------------------- Currency */

/** Monotonic. There is no spend path and no decay — Principle IV, FR-0.7b. */
export async function earn(amount: number, reason: string) {
  if (amount <= 0) return;
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO currency_events (id,amount,reason,occurred_at) VALUES (?,?,?,?)`,
    [uuidv7(), amount, reason, Date.now()]
  );
}

export async function totalXp(): Promise<number> {
  const db = await getDb();
  const r = await db.getFirstAsync<{ s: number | null }>(
    `SELECT SUM(amount) s FROM currency_events`
  );
  return r?.s ?? 0;
}
