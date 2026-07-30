# Contract: Sync Protocol

**Feature**: `001-capture-companion-shell` · **Phase 1** · **Date**: 2026-07-30

The contract between the device and the account. Consumed by `src/sync/`. This is the only interface in
the feature where a capture can be lost, so its guarantees are stated as invariants rather than
behaviours.

---

## Invariants

These hold at every point, including mid-drain, mid-pull, and after any crash.

| # | Invariant |
|---|---|
| **I1** | A capture acknowledged to the person is never absent afterwards. Acknowledgement happens on the buffer write, so the buffer is inside this guarantee (see `plan.md` Complexity Tracking #1) |
| **I2** | No capture is ever removed, replaced, or altered as a result of sync. Sync only ever adds |
| **I3** | `original_text` is never transmitted in an update. Only `edited_text`, `reviewed_at`, and `discarded_at` are mutable over the wire |
| **I4** | No read path blocks on the network. A pull failure is invisible to the person |
| **I5** | Two devices writing concurrently produce the union of their captures, never the intersection and never one overwriting the other |
| **I6** | Replaying the entire outbox is safe. Every operation is idempotent on `id` |

---

## Write path (push)

```
UI submit
   │
   ├─► pending buffer (in memory)        ─── acknowledge to person HERE
   │
   ├─► SQLite insert                     ─── as soon as DB is open
   │
   └─► outbox append                     ─── same transaction as the insert
                │
                ▼
        drain worker (background, retrying)
                │
                ▼
        POST upsert on id → Postgres
```

**Outbox entry**

```
{ id: uuid, entity: 'capture'|'companion'|'profile'|'media_asset',
  entity_id: uuid, op: 'insert'|'update', payload: object,
  attempts: int, created_at: timestamp }
```

Rules:
- The SQLite insert and the outbox append are **one transaction**. A capture that exists locally but
  not in the outbox would sync never; the reverse would sync a phantom.
- Retry with exponential backoff, unbounded. A capture waits indefinitely rather than being dropped.
- `attempts` is diagnostic only. **It never triggers discard**, at any value.
- Drain order is `created_at` ascending. Order is preserved but is not a correctness requirement,
  since ids are time-ordered.
- On `insert` for `capture`: upsert keyed on `id`, and **`original_text` is written only when the row
  does not yet exist** (enforces I3 server-side too, not just client-side).

## Read path (pull)

```
GET changes where rev > cursor, ordered by rev, limit N
   │
   ├─► apply to SQLite (insert-or-update by id)
   │
   └─► advance cursor to max(rev) applied
```

Rules:
- Cursor advances **only** after successful local application. A crash mid-apply re-pulls the same
  page, which is safe by I6.
- Applying a pulled row never deletes a local row. A local row absent from the server is pending, not
  stale.
- `deleted_at` set on a pulled row means discarded, and is applied as a soft state. It never triggers
  a local hard delete.
- Pull is triggered on foreground, on reconnect, and after a successful drain. Never on a read.

## Conflict resolution

| Case | Resolution |
|---|---|
| Same capture id, differing `edited_text` on two devices | Last-writer-wins per row by `updated_at`. Losing text is recoverable because `original_text` is intact on both |
| Same capture id, differing `reviewed_at` / `discarded_at` | Last-writer-wins |
| Same capture id, differing `original_text` | **Cannot occur.** Ids are client-generated uuidv7; two devices cannot generate the same id for different text. If observed, it is a bug — log and keep the existing value, never overwrite |
| Two captures with identical text and different ids | **Both kept.** This is not a conflict. See `data-model.md` on the absence of dedupe |
| Local capture, no server row | Pending. Drain it |
| Server capture, no local row | Pull it |

**There is no merge algorithm for captures**, by design. Principle I forbids merging them, and
last-writer-wins is applied only to the three mutable fields.

## Sign-in transition

Per `data-model.md`:

- **Upgrade path**: no sync operation. The cursor and outbox carry over untouched, because the user id
  did not change.
- **Adopt path**: local rows are re-attributed transactionally, then enqueued as **inserts**. The
  cursor **resets to 0** so the target account's existing history pulls in full. An upsert must never
  be used here — it could overwrite a server row the local device has never seen.

## Failure modes

| Failure | Behaviour |
|---|---|
| No network | Everything works. Outbox grows. Nothing surfaces to the person (I4) |
| Auth expired | Drain pauses, retries after refresh. Captures continue succeeding locally |
| Server rejects a row (validation) | Log, leave in outbox, surface **nothing**. Never discard the row |
| Device storage full | The one case that surfaces an explicit message (FR-016). Loud, because silence here breaks the product's promise |
| Clock skew between devices | Ordering falls back to uuidv7 id order |
| Outbox exceeds 10k entries | Continue accepting. Warn in diagnostics only, never to the person |
