# Phase 1 Data Model: Capture & Companion Shell

**Feature**: `001-capture-companion-shell` · **Date**: 2026-07-30
**Scope**: only the four entities this feature needs. The full product model is
`docs/03-data-model.md`; this is the subset that phase 1 actually creates.

---

## Entities

### Capture

The raw thought, as the person expressed it. **Append-only**: never merged with another capture,
never destroyed by processing, original wording always recoverable.

| Field | Type | Rules |
|---|---|---|
| `id` | uuid (v7, client-generated) | Time-ordered, so creation order survives without a sequence |
| `user_id` | uuid | Rewritten only by the adopt path (R3); never otherwise |
| `original_text` | text | **Immutable after insert.** Satisfies FR-012 structurally |
| `edited_text` | text, nullable | Null until first edit. Display prefers this; `original_text` always recoverable |
| `captured_at` | timestamptz | Device clock at capture. Ordering falls back to `id` when clocks disagree (FR: stable ordering) |
| `source` | enum | `in_app` · `widget` · `voice`. No other value this phase (FR-008a) |
| `audio_asset_id` | uuid, nullable | Set for voice captures (FR-005) |
| `reviewed_at` | timestamptz, nullable | Null = unreviewed. **Not** "overdue" — there is no such state (FR-028) |
| `discarded_at` | timestamptz, nullable | Soft. Recoverable for 30 days, then purged (FR-013) |
| `created_at` / `updated_at` / `deleted_at` / `rev` | — | Standard conventions, `docs/03-data-model.md` §1 |

**Deliberately absent**: `priority`, `rank`, `score`, `is_overdue`, `age_bucket`, `staleness`. A
priority column would bias the future single scorer (Gate 2); an overdue flag would violate FR-028.

**State transitions**:

```
        insert
          │
          ▼
    ┌───────────┐   edit    ┌──────────────┐
    │ unreviewed│──────────►│ unreviewed'  │  (edited_text set; original_text intact)
    └───────────┘           └──────────────┘
          │                        │
          │ mark reviewed          │ mark reviewed
          ▼                        ▼
    ┌────────────────────────────────────┐
    │            reviewed                │
    └────────────────────────────────────┘
          │
          │ discard  (from ANY state)
          ▼
    ┌───────────┐   restore within 30d   ┌──────────────────┐
    │ discarded │◄──────────────────────►│ previous state   │
    └───────────┘                        └──────────────────┘
          │ after 30d
          ▼
       purged
```

Every transition is reversible except purge. There is no transition that destroys `original_text`.

---

### Person (profile)

| Field | Type | Rules |
|---|---|---|
| `id` | uuid | Matches auth user id. **Persists across anonymous → permanent** (R3) |
| `display_name` | text, nullable | Never required |
| `timezone` | text | Default `UTC` |
| `onboarded_at` | timestamptz, nullable | Null = show first use |
| `last_active_at` | timestamptz | Recorded, but **never displayed** and never differenced for the person (FR-022) |
| `personality_enabled` | boolean | Default true. False = plain prompts, full function (FR-025) |
| `low_stim` | boolean | Default false |
| `is_anonymous` | boolean | Derived from auth identity presence, not stored authoritatively |

**Deliberately absent**: `streak`, `capture_count`, `days_active`, `completion_rate`. Any of these
becomes a number the person can feel judged by (FR-031).

---

### Companion

| Field | Type | Rules |
|---|---|---|
| `id` | uuid | |
| `user_id` | uuid | One per person this phase |
| `name` | text | User-supplied at first use, or a default if skipped (FR-018) |
| `species` | text | Fixed set; single option this phase |
| `created_at` / `updated_at` / `rev` | — | Standard |

**Deliberately absent, and asserted absent at build time (R5)**: `mood`, `health`, `hunger`,
`last_fed_at`, `neglect_level`, `streak_state`, `stage`.

`stage` is absent because growth is **computed** from cumulative history (FR-020). Storing it would let
a write path make the companion regress, which is exactly what FR-021 forbids. In this phase cumulative
history is capture count; when currency arrives it becomes the currency event sum. The derivation lives
in `src/domain/companion/growth.ts` and is a pure function of history only — it takes no elapsed-time or
last-seen parameter, so inactivity *cannot* influence it even by accident.

---

### MediaAsset

| Field | Type | Rules |
|---|---|---|
| `id` | uuid | |
| `user_id` | uuid | |
| `kind` | enum | `audio` only this phase |
| `local_path` | text | Device path. **Never synced** |
| `remote_path` | text, nullable | Storage key once uploaded |
| `duration_ms` | int | |
| `bytes` | int | |
| `uploaded_at` | timestamptz, nullable | Null = local only. Capture remains fully valid while null |

A voice capture is complete and usable with `remote_path` null forever — offline-first means audio
upload can never gate the capture (FR-009).

---

### Local-only tables

Not present in Postgres. No server table is created for any of these.

| Table | Purpose |
|---|---|
| `outbox` | `entity`, `entity_id`, `op`, `payload`, `attempts`, `created_at`. Drained by the sync worker |
| `sync_cursor` | Last `rev` successfully pulled |
| `pending_buffer` | **Not a table.** In-memory only, `src/db/buffer.ts` (R2). Persisted by draining, never queried |

**No `places` table is created in this phase** — no location data exists (Gate 12).

---

## Validation rules traced to requirements

| Rule | Source |
|---|---|
| A capture may be inserted with `original_text` as the only non-generated value | FR-001 |
| `original_text` accepts 1 char to unbounded length; no format validation | FR-007 |
| `original_text` is immutable; edits write `edited_text` | FR-012 |
| No insert may require, or wait on, a network call | FR-003, FR-009 |
| No unique constraint on `original_text` or any content hash — identical text inserted twice yields two captures | FR-015b ("never deduplicated") |
| No `ORDER BY captured_at ASC` may be a default in any inbox query | FR-027 |
| Insert failure due to exhausted storage MUST surface explicitly | FR-016 |
| `discarded_at` set → recoverable 30 days → purge | FR-013 |
| Re-attribution rewrites `user_id` transactionally, altering no other column | FR-015b, R3 |
| RLS default-deny on all four tables | Gate 14, NFR-19 |

**The absence of a dedupe constraint is a requirement, not an omission.** The only reliable way to
satisfy "never deduplicated" is to never write dedupe logic — a well-meaning future `UNIQUE` index on
content would silently violate FR-015b.

---

## The two sign-in paths

From R3. These are different enough that conflating them is the likeliest source of data loss.

### Upgrade (common)

```
anonymous user (id = A)  ──add email/OAuth identity──►  permanent user (id = A)
captures.user_id = A                                     captures.user_id = A  ← unchanged
```

**No data operation at all.** The identity link preserves the id, so rows are already correct.
FR-015 is satisfied by the link plus the FR-015a notice.

### Adopt (rare, and where all the risk is)

```
anonymous user (id = A)                    existing account (id = B, already holds captures)
captures.user_id = A                       captures.user_id = B
                        │
                        ▼   sign in as B
        local captures rewritten A → B, transactionally
        then queued to outbox as ordinary inserts
                        │
                        ▼
        both histories present, ordered by captured_at, nothing dropped
```

Rules:
1. Rewrite is **local and transactional** — all rows or none.
2. Rewritten rows enter the outbox as **inserts**, not upserts. An upsert could clobber a server row.
3. **No dedupe, no reorder, no merge of individual captures.** Interleaving is `append both, order by
   captured_at`.
4. The anonymous user id is discarded afterwards and never reused.
5. If the rewrite fails midway, roll back entirely and leave the person signed out with local data
   intact. A failed sign-in must never be a lossy sign-in.

Specified as a pure function in `src/domain/identity/reattribute.ts`: given local rows and a target id,
return the rewritten rows. No I/O in the signature, so it is exhaustively testable (Gate 9).

---

## Migration scope for this phase

`supabase/migrations/0001_capture_companion.sql` creates exactly:

- `global_rev` sequence + `touch_row()` trigger function
- `profiles`, `captures`, `companions`, `media_assets`
- RLS enabled with default-deny + four explicit policies per table
- Indexes: `captures (user_id, reviewed_at) where deleted_at is null`,
  `captures (user_id, captured_at)`

**Nothing else.** No quests, habits, people, places, currency, or commitments — creating them early
invites building against them before their phase gate opens.
