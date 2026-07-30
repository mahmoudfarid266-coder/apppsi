# Contract: Companion Voice & States

**Feature**: `001-capture-companion-shell` · **Phase 1** · **Date**: 2026-07-30

FR-026b requires the companion's vocabulary to be **enumerable as a reviewable set**, so that every
line it can ever say is auditable rather than sampled. This document is that set, plus the build-time
checks that keep it honest.

Governed by constitution Principles IV and XI, both NON-NEGOTIABLE.

---

## The permitted state set

Declared in `src/companion/states.manifest.ts` as a closed union. A test asserts the union is exactly
this set — adding a state fails the build (R5).

| State | When | Notes |
|---|---|---|
| `idle` | Default resting appearance | |
| `attentive` | Person is typing | |
| `acknowledging` | A capture was just held | Brief, then returns to `idle` |

**Forbidden, and asserted absent:** `sad`, `sick`, `hungry`, `neglected`, `disappointed`,
`deteriorated`, `sleeping`, `dusty`, `waiting`, `lonely`, and any variant conveying that the person's
absence or inaction had a cost.

The assertion is on the **artefact set**, not on behaviour. An unused `sad` asset still fails the
build, because FR-021 says no such depiction may exist to be shown — not merely that it must not be
reached.

## State derivation

```ts
// src/domain/companion/growth.ts  — PURE. Note what is NOT in the signature.
function growthStage(history: { captureCount: number }): GrowthStage
```

The signature takes **no** `lastSeenAt`, `daysSinceActive`, `streak`, or `now`. Inactivity cannot
influence growth even by accident, because the function has no way to observe it. This is the
mechanical form of FR-020, and it is why the parameter is a history object rather than a full profile.

Stage thresholds are cumulative and **monotonic** — stage never decreases. A test asserts
`growthStage(h1) <= growthStage(h2)` for all `h1.captureCount <= h2.captureCount`.

---

## The full vocabulary

Every string the companion can utter in this phase. Declared in `src/companion/voice.catalogue.ts`.
Additions require review against this contract.

### On arrival

| Key | String |
|---|---|
| `arrive.1` | `You're here.` |
| `arrive.2` | `Morning.` / `Afternoon.` / `Evening.` *(time-of-day, not absence-derived)* |
| `arrive.3` | `Hello again.` |

### On capture held

| Key | String |
|---|---|
| `held.1` | `Got it.` |
| `held.2` | `Held.` |
| `held.3` | `That's safe now.` |
| `held.4` | `Noted.` |

### Empty inbox (FR-029)

| Key | String |
|---|---|
| `empty.1` | `Nothing needs you right now.` |

### After sign-in merge (FR-015a)

| Key | String |
|---|---|
| `merged.1` | `Everything you'd already written is in your account now.` |

**That is the entire set for this phase.** 12 strings.

`arrive.3` is "Hello again" and deliberately not "Long time no see" — the latter derives from absence,
which FR-022 forbids.

---

## Banned patterns (CI lint)

`.github/workflows/ci.yml` runs a check over the catalogue. Any match fails the build.

| Category | Patterns | Principle |
|---|---|---|
| Money | `$`, `£`, `€`, `charge`, `owe`, `forfeit`, `stake`, `paid`, `refund`, `balance` | XI (FR-024) |
| Shame / failure | `fail`, `failed`, `missed`, `behind`, `should have`, `didn't`, `neglect`, `lost`, `broke`, `streak` | IV (FR-023) |
| Manufactured urgency | `!`, `hurry`, `now!`, `don't forget`, `last chance`, `finally` | XI |
| Counts of not-done | `remaining`, `overdue`, `days since`, `you have N`, `left to do` | IV (FR-031) |
| Absence references | `been a while`, `long time`, `where have you been`, `welcome back` | IV (FR-022) |

Notes:
- `!` is banned in **companion** strings only. System copy elsewhere may use it; the companion never
  manufactures enthusiasm (Principle XI).
- `welcome back` is banned despite sounding warm — it foregrounds the gap, which is exactly what
  FR-022 prohibits. `Hello again` carries the warmth without the accounting.
- The lint runs on the catalogue file, so it cannot be bypassed by inlining a string in a component:
  a second check fails the build on any user-facing string literal outside the catalogue.

---

## Personality-off contract

With `personality_enabled = false` (FR-025):

| Companion string | Plain replacement |
|---|---|
| `arrive.*` | *(nothing rendered)* |
| `held.*` | `Saved` |
| `empty.1` | `No items` |
| `merged.1` | `Local items added to your account` |

The companion's visual remains present but static. **Every requirement in the spec must still pass
with personality off** — this is asserted by running the full component suite twice, once in each
mode. The plain mode is not a degraded path; it is a supported one.
