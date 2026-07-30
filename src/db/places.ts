import { uuidv7 } from 'uuidv7';
import { getDb } from './index';

/**
 * PLACES ARE LOCAL-ONLY. This is the most important privacy boundary in the
 * product (constitution Principle XII, data-model.md §3).
 *
 *   DEVICE                          |  SERVER
 *   places (label, lat, lon)  LOCAL |  ✗ no table exists
 *   place_visits              LOCAL |  ✗ no table exists
 *   quest_triggers.place_id  ------>|  opaque uuid, no geometry
 *
 * The server cannot leak what it was never given. On a new device, place-bound
 * quests arrive intact but dormant until re-anchored — a dormant quest is
 * recoverable, a leaked home address is not.
 *
 * Nothing in this file may be added to the sync outbox. Ever.
 */

export type TriggerKind = 'arrive' | 'leave' | 'pass_near' | 'while_out';

export interface Place {
  id: string;
  label: string;
  lat: number;
  lon: number;
  radiusM: number;
  isHome: number; // 1 = counts as "home" for the while_out trigger
}

export interface Quest {
  id: string;
  title: string;
  placeId: string | null;
  triggerKind: TriggerKind | null;
  estimateMinutes: number | null;
  doneAt: number | null;
  createdAt: number;
}

export const SCHEMA_PLACES = `
CREATE TABLE IF NOT EXISTS places (
  id        TEXT PRIMARY KEY NOT NULL,
  label     TEXT NOT NULL,
  lat       REAL NOT NULL,
  lon       REAL NOT NULL,
  radius_m  INTEGER NOT NULL DEFAULT 250,
  is_home   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS quests (
  id               TEXT PRIMARY KEY NOT NULL,
  title            TEXT NOT NULL,
  place_id         TEXT REFERENCES places(id) ON DELETE SET NULL,
  trigger_kind     TEXT,
  estimate_minutes INTEGER,
  done_at          INTEGER,
  created_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS quests_place ON quests (place_id) WHERE done_at IS NULL;

-- Movement history. Never synced, never backed up, 90-day rolling window.
CREATE TABLE IF NOT EXISTS place_visits (
  id         TEXT PRIMARY KEY NOT NULL,
  place_id   TEXT NOT NULL,
  arrived_at INTEGER NOT NULL
);
`;

/* ------------------------------------------------------------------ places */

export async function addPlace(
  label: string,
  lat: number,
  lon: number,
  radiusM = 250,
  isHome = false
): Promise<Place> {
  const db = await getDb();
  const place: Place = { id: uuidv7(), label, lat, lon, radiusM, isHome: isHome ? 1 : 0 };
  await db.runAsync(
    `INSERT INTO places (id, label, lat, lon, radius_m, is_home) VALUES (?, ?, ?, ?, ?, ?)`,
    [place.id, place.label, place.lat, place.lon, place.radiusM, place.isHome]
  );
  return place;
}

export async function listPlaces(): Promise<Place[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: string;
    label: string;
    lat: number;
    lon: number;
    radius_m: number;
    is_home: number;
  }>(`SELECT * FROM places ORDER BY label`);
  return rows.map((r) => ({
    id: r.id,
    label: r.label,
    lat: r.lat,
    lon: r.lon,
    radiusM: r.radius_m,
    isHome: r.is_home,
  }));
}

export async function deletePlace(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM places WHERE id = ?`, [id]);
}

/* ------------------------------------------------------------------ quests */

export async function addQuest(
  title: string,
  placeId: string | null = null,
  triggerKind: TriggerKind | null = null,
  estimateMinutes: number | null = null
): Promise<Quest> {
  const db = await getDb();
  const q: Quest = {
    id: uuidv7(),
    title,
    placeId,
    triggerKind: placeId ? (triggerKind ?? 'arrive') : null,
    estimateMinutes,
    doneAt: null,
    createdAt: Date.now(),
  };
  await db.runAsync(
    `INSERT INTO quests (id, title, place_id, trigger_kind, estimate_minutes, done_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [q.id, q.title, q.placeId, q.triggerKind, q.estimateMinutes, null, q.createdAt]
  );
  return q;
}

/** Open quests, newest first. NEVER oldest-first (FR-027). */
export async function listQuests(placeId?: string): Promise<Quest[]> {
  const db = await getDb();
  const sql = placeId
    ? `SELECT * FROM quests WHERE done_at IS NULL AND place_id = ? ORDER BY created_at DESC`
    : `SELECT * FROM quests WHERE done_at IS NULL ORDER BY created_at DESC`;
  const rows = await db.getAllAsync<{
    id: string;
    title: string;
    place_id: string | null;
    trigger_kind: TriggerKind | null;
    estimate_minutes: number | null;
    done_at: number | null;
    created_at: number;
  }>(sql, placeId ? [placeId] : []);
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    placeId: r.place_id,
    triggerKind: r.trigger_kind,
    estimateMinutes: r.estimate_minutes,
    doneAt: r.done_at,
    createdAt: r.created_at,
  }));
}

export async function completeQuest(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`UPDATE quests SET done_at = ? WHERE id = ?`, [Date.now(), id]);
}

export async function recordVisit(placeId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`INSERT INTO place_visits (id, place_id, arrived_at) VALUES (?, ?, ?)`, [
    uuidv7(),
    placeId,
    Date.now(),
  ]);
  // 90-day rolling window — movement history is the most sensitive data here.
  await db.runAsync(`DELETE FROM place_visits WHERE arrived_at < ?`, [
    Date.now() - 90 * 86_400_000,
  ]);
}
