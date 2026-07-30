import { uuidv7 } from 'uuidv7';
import { getDb } from './index';
import { earn } from './systems';

/**
 * Medication, sleep, focus sessions, breaks, progress logs, solo quests.
 *
 * ⚠️ MEDICATION IS A LOG AND A REMINDER, NEVER A DOSING ENGINE.
 * No drug database ships. Dose is free text the person typed. Nothing here
 * suggests, calculates, adjusts, or comments on what or how much, and no
 * interaction checking exists — permanently out of scope (constitution,
 * Security §). A missed dose is never counted or shown as an adherence
 * failure on any home surface.
 */

export const SCHEMA_WELLBEING = `
CREATE TABLE IF NOT EXISTS sleep_schedule (
  id            TEXT PRIMARY KEY NOT NULL,
  wake_hour     INTEGER NOT NULL,
  wake_minute   INTEGER NOT NULL,
  target_hours  INTEGER NOT NULL DEFAULT 8,
  winddown_mins INTEGER NOT NULL DEFAULT 45,
  active        INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS focus_sessions (
  id          TEXT PRIMARY KEY NOT NULL,
  label       TEXT,
  minutes     INTEGER NOT NULL,
  started_at  INTEGER NOT NULL,
  ended_at    INTEGER,
  distractions INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS break_events (
  id          TEXT PRIMARY KEY NOT NULL,
  kind        TEXT NOT NULL,      -- taken | deferred
  occurred_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS progress_logs (
  id         TEXT PRIMARY KEY NOT NULL,
  body       TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS solo_progress (
  quest_id     TEXT PRIMARY KEY NOT NULL,
  completed_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS exercise_seen (
  exercise_id TEXT PRIMARY KEY NOT NULL,
  seen_at     INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS profile (
  id             INTEGER PRIMARY KEY CHECK (id = 1),
  companion_name TEXT,
  onboarded_at   INTEGER,
  personality    INTEGER NOT NULL DEFAULT 1
);
`;

/* ------------------------------------------------------------------ profile */

export async function getProfile() {
  const db = await getDb();
  let row = await db.getFirstAsync<{
    companion_name: string | null;
    onboarded_at: number | null;
    personality: number;
  }>(`SELECT companion_name, onboarded_at, personality FROM profile WHERE id = 1`);
  if (!row) {
    await db.runAsync(`INSERT OR IGNORE INTO profile (id, personality) VALUES (1, 1)`);
    row = { companion_name: null, onboarded_at: null, personality: 1 };
  }
  return row;
}

export async function setCompanionName(name: string) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO profile (id, companion_name) VALUES (1, ?)
     ON CONFLICT(id) DO UPDATE SET companion_name = excluded.companion_name`,
    [name]
  );
}

export async function finishOnboarding() {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO profile (id, onboarded_at) VALUES (1, ?)
     ON CONFLICT(id) DO UPDATE SET onboarded_at = excluded.onboarded_at`,
    [Date.now()]
  );
}

export async function setPersonality(on: boolean) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO profile (id, personality) VALUES (1, ?)
     ON CONFLICT(id) DO UPDATE SET personality = excluded.personality`,
    [on ? 1 : 0]
  );
}

/* -------------------------------------------------------------- medication */

export interface Medication {
  id: string;
  name: string;
  doseText: string | null;
  times: string[];
  takenToday: number;
}

export async function listMeds(): Promise<Medication[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: string;
    name: string;
    dose_text: string | null;
    times: string;
  }>(`SELECT id,name,dose_text,times FROM medications WHERE active = 1 ORDER BY name`);
  const dayStart = new Date().setHours(0, 0, 0, 0);
  const out: Medication[] = [];
  for (const r of rows) {
    const c = await db.getFirstAsync<{ n: number }>(
      `SELECT COUNT(*) n FROM med_events WHERE med_id = ? AND state = 'taken' AND occurred_at >= ?`,
      [r.id, dayStart]
    );
    out.push({
      id: r.id,
      name: r.name,
      doseText: r.dose_text,
      times: r.times.split(',').filter(Boolean),
      takenToday: c?.n ?? 0,
    });
  }
  return out;
}

/** Dose is FREE TEXT. No drug database, no validation, no suggestion. */
export async function addMed(name: string, doseText: string, times: string[]) {
  const db = await getDb();
  const id = uuidv7();
  await db.runAsync(
    `INSERT INTO medications (id,name,dose_text,times,active) VALUES (?,?,?,?,1)`,
    [id, name, doseText || null, times.join(',')]
  );
  return id;
}

export async function logMed(medId: string, state: 'taken' | 'skipped' | 'late') {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO med_events (id,med_id,state,occurred_at) VALUES (?,?,?,?)`,
    [uuidv7(), medId, state, Date.now()]
  );
  // No XP for medication. Health behaviours are never gamified or scored.
}

export async function deleteMed(id: string) {
  const db = await getDb();
  await db.runAsync(`UPDATE medications SET active = 0 WHERE id = ?`, [id]);
}

/* ------------------------------------------------------------------- sleep */

export async function getSleep() {
  const db = await getDb();
  return db.getFirstAsync<{
    id: string;
    wake_hour: number;
    wake_minute: number;
    target_hours: number;
    winddown_mins: number;
  }>(`SELECT * FROM sleep_schedule WHERE active = 1 LIMIT 1`);
}

export async function setSleep(wakeHour: number, wakeMinute: number, targetHours: number) {
  const db = await getDb();
  await db.runAsync(`UPDATE sleep_schedule SET active = 0`);
  await db.runAsync(
    `INSERT INTO sleep_schedule (id,wake_hour,wake_minute,target_hours,winddown_mins,active)
     VALUES (?,?,?,?,45,1)`,
    [uuidv7(), wakeHour, wakeMinute, targetHours]
  );
}

/**
 * Works BACKWARDS from wake time — the constitution's framing (FR-3.7).
 * Returns wall-clock for bedtime and the start of wind-down.
 * No sleep tracking, no sleep scoring, no quality claims.
 */
export function sleepWindow(wakeHour: number, wakeMinute: number, targetHours: number, winddownMins: number) {
  const wake = wakeHour * 60 + wakeMinute;
  const bed = (wake - targetHours * 60 + 1440 * 2) % 1440;
  const wind = (bed - winddownMins + 1440) % 1440;
  const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  return { bedtime: fmt(bed), winddown: fmt(wind), bedMinutes: bed, windMinutes: wind };
}

/* ------------------------------------------------------------------ focus */

export async function startFocus(minutes: number, label?: string) {
  const db = await getDb();
  const id = uuidv7();
  await db.runAsync(
    `INSERT INTO focus_sessions (id,label,minutes,started_at,distractions) VALUES (?,?,?,?,0)`,
    [id, label ?? null, minutes, Date.now()]
  );
  return id;
}

export async function endFocus(id: string) {
  const db = await getDb();
  await db.runAsync(`UPDATE focus_sessions SET ended_at = ? WHERE id = ?`, [Date.now(), id]);
  const r = await db.getFirstAsync<{ minutes: number }>(
    `SELECT minutes FROM focus_sessions WHERE id = ?`,
    [id]
  );
  await earn(Math.max(1, Math.round((r?.minutes ?? 0) / 5)), 'focus');
}

export async function noteDistraction(id: string) {
  const db = await getDb();
  await db.runAsync(
    `UPDATE focus_sessions SET distractions = distractions + 1 WHERE id = ?`,
    [id]
  );
}

/**
 * Breaks are FRICTION, never lockout (Principle XIII). A deferred break is
 * recorded only so allostatic load can rise — it is never counted against the
 * person, never shown as a total, and never surfaced later.
 */
export async function logBreak(kind: 'taken' | 'deferred') {
  const db = await getDb();
  await db.runAsync(`INSERT INTO break_events (id,kind,occurred_at) VALUES (?,?,?)`, [
    uuidv7(),
    kind,
    Date.now(),
  ]);
}

export async function hoursSinceBreak(): Promise<number> {
  const db = await getDb();
  const r = await db.getFirstAsync<{ t: number | null }>(
    `SELECT MAX(occurred_at) t FROM break_events WHERE kind = 'taken'`
  );
  if (!r?.t) return 0;
  return (Date.now() - r.t) / 3_600_000;
}

/* --------------------------------------------------- progress + solitude */

export async function addProgressLog(body: string) {
  const db = await getDb();
  await db.runAsync(`INSERT INTO progress_logs (id,body,created_at) VALUES (?,?,?)`, [
    uuidv7(),
    body,
    Date.now(),
  ]);
  await earn(5, 'progress');
}

export async function listProgressLogs() {
  const db = await getDb();
  return db.getAllAsync<{ id: string; body: string; created_at: number }>(
    `SELECT * FROM progress_logs ORDER BY created_at DESC`
  );
}

export async function completeSolo(questId: string) {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO solo_progress (quest_id,completed_at) VALUES (?,?)`,
    [questId, Date.now()]
  );
  await earn(8, 'solitude');
}

export async function completedSolo(): Promise<Set<string>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ quest_id: string }>(`SELECT quest_id FROM solo_progress`);
  return new Set(rows.map((r) => r.quest_id));
}

export async function markExerciseSeen(id: string) {
  const db = await getDb();
  await db.runAsync(`INSERT OR REPLACE INTO exercise_seen (exercise_id,seen_at) VALUES (?,?)`, [
    id,
    Date.now(),
  ]);
}
