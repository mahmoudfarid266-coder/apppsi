import * as SQLite from 'expo-sqlite';
import { uuidv7 } from 'uuidv7';

/**
 * Local store + the in-memory pending buffer.
 *
 * THE BUFFER IS THE LOAD-BEARING DECISION (research R2). The capture input must
 * never block on storage: FR-002 (<2s cold launch to typing) and FR-003 (no
 * perceptible write delay) cannot both hold if the field waits for SQLite to
 * open and migrate.
 *
 * Acknowledgement to the person fires on the BUFFER write. The buffer drains on
 * the first tick after the database opens, and again on background transition.
 *
 * The window where a capture exists only in memory is recorded honestly in
 * plan.md Complexity Tracking #1. `tests/e2e/kill-mid-buffer` guards it. If that
 * test proves flaky, switch to the flat-file path held in reserve — do NOT
 * weaken the guarantee.
 */

export interface Capture {
  id: string;
  originalText: string;
  editedText: string | null;
  capturedAt: number;
  source: 'in_app' | 'widget' | 'voice';
  reviewedAt: number | null;
  discardedAt: number | null;
}

let db: SQLite.SQLiteDatabase | null = null;
let opening: Promise<void> | null = null;

/** Captures accepted before the database was ready. */
const pending: Capture[] = [];
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((l) => l());

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

const SCHEMA = `
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS captures (
  id            TEXT PRIMARY KEY NOT NULL,
  original_text TEXT NOT NULL,
  edited_text   TEXT,
  captured_at   INTEGER NOT NULL,
  source        TEXT NOT NULL DEFAULT 'in_app',
  reviewed_at   INTEGER,
  discarded_at  INTEGER
);
CREATE INDEX IF NOT EXISTS captures_captured_at ON captures (captured_at DESC);
`;
// Deliberately NO unique constraint on original_text and no content hash.
// "Never deduplicated" (FR-015b) is only achievable by never writing dedupe
// logic. Two identical thoughts captured twice are two real captures.

export function open(): Promise<void> {
  if (opening) return opening;
  opening = (async () => {
    const handle = await SQLite.openDatabaseAsync('rudder.db');
    await handle.execAsync(SCHEMA);
    // Places, quests, and visits. All local-only — see src/db/places.ts.
    const { SCHEMA_PLACES } = await import('./places');
    await handle.execAsync(SCHEMA_PLACES);
    const { SCHEMA_SYSTEMS, seedDefaults } = await import('./systems');
    await handle.execAsync(SCHEMA_SYSTEMS);
    db = handle;
    await seedDefaults();
    await drain();
  })();
  return opening;
}

/** Await the open database. Used by modules that cannot run before init. */
export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) await open();
  if (!db) throw new Error('database unavailable');
  return db;
}

/** Move anything buffered into durable storage. Safe to call repeatedly. */
export async function drain(): Promise<void> {
  if (!db || pending.length === 0) return;
  const batch = pending.splice(0, pending.length);
  for (const c of batch) {
    await db.runAsync(
      `INSERT OR IGNORE INTO captures
         (id, original_text, edited_text, captured_at, source, reviewed_at, discarded_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [c.id, c.originalText, c.editedText, c.capturedAt, c.source, c.reviewedAt, c.discardedAt]
    );
  }
  notify();
}

/**
 * Accept a capture. Returns synchronously-fast: the buffer write is the
 * acknowledgement. Zero required fields (FR-001), no network (FR-003).
 */
export function capture(text: string, source: Capture['source'] = 'in_app'): Capture {
  const row: Capture = {
    id: uuidv7(), // time-ordered, so creation order survives without a sequence
    originalText: text,
    editedText: null,
    capturedAt: Date.now(),
    source,
    reviewedAt: null,
    discardedAt: null,
  };
  pending.push(row);
  notify();
  // Fire-and-forget: durability catches up, the person does not wait for it.
  void (db ? drain() : open());
  return row;
}

/** Newest first. NEVER oldest-first — that is a shame list (FR-027). */
export async function list(): Promise<Capture[]> {
  const buffered = [...pending].reverse();
  if (!db) return buffered;
  const rows = await db.getAllAsync<{
    id: string;
    original_text: string;
    edited_text: string | null;
    captured_at: number;
    source: Capture['source'];
    reviewed_at: number | null;
    discarded_at: number | null;
  }>(
    `SELECT * FROM captures WHERE discarded_at IS NULL ORDER BY captured_at DESC, id DESC LIMIT 200`
  );
  const stored = rows.map((r) => ({
    id: r.id,
    originalText: r.original_text,
    editedText: r.edited_text,
    capturedAt: r.captured_at,
    source: r.source,
    reviewedAt: r.reviewed_at,
    discardedAt: r.discarded_at,
  }));
  const seen = new Set(stored.map((s) => s.id));
  return [...buffered.filter((b) => !seen.has(b.id)), ...stored];
}

export async function count(): Promise<number> {
  if (!db) return pending.length;
  const row = await db.getFirstAsync<{ n: number }>(
    `SELECT COUNT(*) AS n FROM captures WHERE discarded_at IS NULL AND reviewed_at IS NULL`
  );
  return (row?.n ?? 0) + pending.length;
}
