# Implementation Plan: Capture & Companion Shell

**Branch**: `001-capture-companion-shell` | **Date**: 2026-07-30 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-capture-companion-shell/spec.md`

**Phase 0**: [research.md](research.md) · **Phase 1**: [data-model.md](data-model.md) ·
[contracts/](contracts/) · [quickstart.md](quickstart.md)

## Summary

Ship the smallest thing that is genuinely a daily driver: a capture path fast enough to beat the
thought's escape (under 2s to typing, no perceptible write delay, zero required fields), storage that
never loses a capture across offline stretches or two devices, and a named companion present from
first launch whose depiction and language can never shame the person.

The technical approach is shaped by three Phase 0 findings. A widget cannot host a text field, so the
widget is a deep-link launcher and **no Swift target is needed this phase**. Cold launch under 2s is
only achievable if the input never blocks on storage, so submitted text lands in an **in-memory pending
buffer** that drains once the database opens. And sign-in has two paths — the common one preserves the
user id and needs no merge at all, while the rare "sign into an existing account" path is where the
entire data-loss risk lives.

## Technical Context

**Language/Version**: TypeScript 5.x · React 19.2 · React Native 0.85

**Primary Dependencies**: Expo SDK 57 · `expo-router` · `expo-sqlite` + `drizzle-orm` ·
`nativewind` v4 · `zustand` · `expo-speech-recognition` · `@supabase/supabase-js`

**Storage**: Device SQLite (WAL) as the UI's source of truth; Supabase Postgres as the account's
source of truth. Local `outbox` table for pending mutations.

**Testing**: `vitest` for `src/domain/` (pure, no simulator) · `jest-expo` +
`@testing-library/react-native` for components · Maestro for the cold-launch and kill-mid-buffer
flows · a cold-launch timing harness for SC-001

**Target Platform**: iPadOS 18+ / iOS 18+.
**Reference device: iPad Air 4th generation (2020)** — A14 Bionic, 4 GB RAM, 10.9″ at 2360×1640px =
**1180×820 points** @2x, no notch, no Dynamic Island, Touch ID in the top button, home-indicator
gesture bar present. Runs iPadOS 26. Supports Split View and Slide Over; **does not** support Stage
Manager (M1+ only).

> ⚠️ **Corrected 2026-07-30.** Earlier drafts named "iPad Air M1" — that is the Air *5th* gen. The
> actual device is an A14 with half the RAM. See Complexity Tracking #2.

**Project Type**: Mobile app + managed backend. No web, no Android this phase.

**Performance Goals**: cold launch → first keystroke < 2.0s in 95/100 attempts **on the A14**
(SC-001) · acknowledged capture write with no perceptible delay (SC-002) · full offline operation
indefinitely

**Constraints**: No Mac available — all iOS builds via EAS cloud. **A physical-device build requires
Apple Developer Program enrolment; there is no free path to an installable `.ipa`.** No native Swift
target this phase (confirmed by R1). No network on any read or write path. LF line endings. No AI, no
location, no notifications in this phase.

**Layout constraints (new)**: the app must render correctly at every width the reference device can
produce — full screen 1180×820pt and 820×1180pt, Split View halves and thirds, and Slide Over at
~320pt. All four orientations. Hardware-keyboard capable.

**Scale/Scope**: One person, up to ~5 of their own devices, ~10k captures over the app's life.
4 user stories, 41 functional requirements, 9 success criteria.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Derived from `.specify/memory/constitution.md` v2.0.0. Mark each gate PASS / FAIL / N/A.
Any FAIL carried into implementation MUST be justified in Complexity Tracking below.

**Gate 0 — the loop.** Before anything else: name the stage of SENSE → DECIDE → OFFER → DO →
MARK → SETTLE that this feature occupies, and the system it belongs to (Quests, Rhythms,
Regulation, Bonds, Solitude, Record, Stakes). A feature that occupies no stage does not ship.

> **Stages**: **SENSE** (capture is the app's primary sensing input) · **OFFER** (the companion is
> present, acknowledging arrival and capture) · **MARK** (reviewing, editing, discarding).
> **DECIDE**, **DO**, and **SETTLE** are deliberately absent — there is no ranking, no timed action,
> and no currency in this phase.
> **Systems**: **Quests** (the capture inbox is its front door) and the **Companion** presentation
> layer that spans all systems. No other system is touched.
> **Verdict: PASS.**

| # | Gate | Principle | Status |
|---|------|-----------|--------|
| 1 | No new required field, picker, or decision is added to the capture path. Local write stays <50ms with no network call. Captures cannot be lost to a conflict. | I (NON-NEGOTIABLE) | **PASS** — this feature *is* the capture path. FR-001–007. Buffer (R2) keeps the acknowledged write off the storage-init path. Conflict-safety by append-only + FR-011. ⚠️ see Complexity Tracking #1 |
| 2 | Home surfaces exactly one action, drawn from a single cross-system scorer — not a per-system list merged afterwards. Offer carries exactly three affordances. Backlog is never shown by default or sorted oldest-first. | II | **PARTIAL / N/A** — no scorer exists this phase, so the one-card rule has nothing to rank. The backlog clauses **do** apply and are met by FR-027–029. Nothing built here may make a future single scorer harder: captures carry no priority field |
| 3 | Any duration this feature introduces is represented visually first; numeric readout is subordinate. Timer state restores from wall-clock. Any place-bound quest gets automatic travel + calibrated padding. | III | **N/A** — this phase introduces no durations, timers, or places |
| 4 | No red is introduced outside destructive-confirm dialogs. No failure count, no breakable streak, no guilt copy. Companion never degrades on absence. Re-entry suppression still applies. | IV (NON-NEGOTIABLE) | **PASS** — FR-020–024, FR-027–031, FR-034. Enforced at build time by the asset-manifest assertion and copy-catalogue lint (R5), not by review discipline. SC-006 and SC-009 verify |
| 5 | Every screen in this feature is completable by accepting defaults alone. Nothing asks the user to recall what the app could infer. | V | **PASS** — FR-032 (skip everything, reach a working screen <90s), FR-001 (zero required fields), FR-018 (companion default name) |
| 6 | Every P0 path works in airplane mode. Writes go to SQLite + outbox and return immediately. Time-critical and geofence notifications are scheduled locally, not pushed. New counters are event rows, not mutable integers. Nothing network-dependent blocks a P0 path. | VI (NON-NEGOTIABLE) | **PASS** — FR-003, FR-009–011, FR-017. No notifications and no counters exist this phase, so those clauses are vacuous rather than violated |
| 7 | Reduce Motion / Reduce Transparency / Increase Contrast / Dynamic Type honoured, companion included. Low-stim collapses animation to 0ms. Contrast ≥AA, targets ≥48pt, VoiceOver labels present. Overstim state collapses to one action. | VII | **PASS** — FR-035, FR-036, explicitly including the companion. Overstim declaration is a later phase, so that clause is N/A |
| 8 | Feature remains fully usable with AI disabled. AI failure, offline, and spend-cap states degrade to the manual path without surfacing an error. AI touches no stake resolution and no crisis path. | VIII (NON-NEGOTIABLE) | **PASS** — trivially. No AI is present in this phase at all. Captures are held verbatim; a raw capture is a complete valid outcome (spec Assumptions) |
| 9 | New business rules live in `src/domain/` as pure TypeScript, developed test-first. Derived values (including drift and load) are computed, not stored. | IX | **PASS** — three rule sets qualify and all go in `src/domain/`: capture ordering, sign-in re-attribution (R3), and companion growth-stage derivation. Growth stage is computed from cumulative history, never stored (FR-020) |
| 10 | If this feature touches stakes: all ten conditions of Principle X hold… | X (NON-NEGOTIABLE) | **N/A** — no stakes, no currency, no money. No table for any of it exists |
| 11 | Companion never references money or settlement, never shames, narrates patterns not incidents, and its state is independent of streak or absence. Ledger surfaces use no companion voice or vocabulary. | XI (NON-NEGOTIABLE) | **PASS** — FR-023, FR-024, FR-026a (no pattern narration this phase, as there is no history to draw on), FR-020. Copy lint enforces (R5) |
| 12 | Precise location never leaves the device; real-time position and location history are never exposed… Feature degrades when permission is denied. | XII (NON-NEGOTIABLE) | **PASS by exclusion** — no location permission is requested and no location data is handled or stored (spec Assumptions). The `places` table is not created in this phase's migrations |
| 13 | Nothing blocks or locks out. The intended action is pre-selected and one tap; declining costs ~15s… | XIII | **N/A** — nothing is enforced in this phase. There are no breaks, meditations, or wind-downs |
| 14 | RLS enabled with default-deny policies on every new table, covered by the CI cross-user test. No API key or `service_role` reaches the client. | Security § | **PASS** — required on `profiles`, `captures`, `companions`, `media_assets`. CI test enumerates from `information_schema` so a future table without policies fails the build (NFR-19) |
| 15 | No PHI written to iCloud. No SDK receives task titles, capture text, med names, check-in values, notes, contact names, place names, or coordinates. Contact records stay on-device and build no cross-user social graph. | Security § | **PASS** — SQLite marked excluded from backup. Sentry `beforeSend` strips capture text and audio references, asserted by unit test. No contact or location data exists this phase |
| 16 | Nothing diagnoses, doses, or claims efficacy. Curriculum content is framed as exercises… Crisis paths are static and human-authored. | Security § | **N/A** — no health content, no curriculum, no crisis surface in this phase |
| 17 | The app holds, pools, escrows, or redistributes no user funds… No crypto, token, wallet, or DAO. Soft currency has no cash value and is not purchasable or convertible. | Security § | **N/A** — no currency of any kind exists this phase |
| 18 | If this feature requires other human users: the solo app is already the owner's daily driver, and phase N-1 has had a full week of real use. | Workflow § | **PASS** — single-person scope, explicitly. This *is* phase 1; there is no phase 0 build to gate against |

**Initial gate result: PASS.** No FAIL. One tension recorded below rather than waved through.

### Post-design re-check (after Phase 1)

Re-evaluated against [data-model.md](data-model.md) and [contracts/](contracts/):

- **Gate 1** — the data model keeps `captures` append-only with `original_text` immutable after edit,
  so FR-012 and FR-011 are structural rather than procedural. Still **PASS**, and Complexity Tracking
  #1 remains the only open tension.
- **Gate 2** — confirmed `captures` carries no priority, rank, or score column, so nothing in this
  schema biases a future scorer. **PASS**.
- **Gate 4** — confirmed the schema has no `streak`, `count`, `missed`, or companion-mood column, and
  the companion contract enumerates only permitted states. **PASS**.
- **Gate 9** — confirmed re-attribution and growth-stage derivation are specified as pure functions in
  the contracts, with no I/O in their signatures. **PASS**.
- **Gate 12** — confirmed no migration in this phase creates any location-bearing table or column.
  **PASS**.
- **Gate 14** — confirmed all four tables have default-deny RLS in the migration. **PASS**.

**Post-design gate result: PASS.** No new violations introduced by the design.

## Project Structure

### Documentation (this feature)

```text
specs/001-capture-companion-shell/
├── plan.md              # This file
├── spec.md              # Feature specification (clarified)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── sync-protocol.md
│   ├── companion-voice.md
│   └── app-entry-points.md
├── checklists/
│   └── requirements.md  # Spec quality checklist — all items passing
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
app/                              # expo-router routes
├── _layout.tsx                   # deliberately thin — nothing blocking above capture
├── index.tsx                     # capture screen = initial route (R2)
├── inbox.tsx                     # review captures (US4)
├── onboarding/                   # first use, every step skippable (FR-032)
└── settings/

src/
├── domain/                       # PURE TypeScript. No React, no I/O. Test-first.
│   ├── capture/ordering.ts       # stable ordering across clock changes
│   ├── identity/reattribute.ts   # sign-in adopt-path rules (R3)
│   └── companion/growth.ts       # stage from cumulative history (FR-020)
├── systems/
│   └── quests/                   # capture write path, pending buffer, inbox queries
├── companion/
│   ├── states.manifest.ts        # typed state set — asserted exhaustive (R5)
│   └── voice.catalogue.ts        # every line it can say — lint target (R5)
├── db/
│   ├── schema.ts                 # drizzle schema
│   ├── migrations/
│   └── buffer.ts                 # in-memory pending buffer + drain (R2)
├── sync/
│   ├── outbox.ts
│   ├── puller.ts
│   └── cursor.ts
├── ui/                           # design primitives, no-red palette
└── lib/                          # supabase client, speech, time injection

supabase/
├── migrations/                   # profiles · captures · companions · media_assets + RLS
└── tests/rls.test.sql            # cross-user isolation, enumerated from information_schema

tests/
├── domain/                       # vitest — pure, no simulator
├── components/                   # jest-expo
├── e2e/                          # Maestro: cold launch, kill-mid-buffer, offline week
└── perf/coldstart.ts             # SC-001 harness

.github/workflows/ci.yml          # domain tests · copy lint · asset assertion · RLS test
```

**Structure Decision**: Mobile app plus managed backend. `src/domain/` is pure and depends on nothing;
`src/systems/` depends on `domain`, never the reverse. `src/companion/` holds the two artefacts that
R5 makes build-enforceable. No `ios/` native target this phase — R1 removed the need for one.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| **#1 — In-memory pending buffer creates a window where a capture is not yet durable**, which is in tension with Principle I's "a capture MUST NEVER be lost" | FR-002 (<2s cold launch to typing) and FR-003 (no perceptible write delay) cannot both hold on a cold launch if the input waits for SQLite to open and migrate. The widget deep-link path (R1) makes cold launch routine, not rare, so this is the common case rather than an edge | **Blocking the input until storage is ready** was rejected: it fails FR-002 on every cold launch, and a capture the person could not start typing is already lost. **Writing to a flat file first** is a genuine alternative and is held in reserve — rejected for now only because it creates a second durability path to reason about, doubling the surface where loss can hide. Mitigation is mandatory: drain on the first tick after DB open, drain on background transition, and an e2e test that force-kills the process mid-buffer (`tests/e2e/kill-mid-buffer`). If that test proves flaky, adopt the flat-file path rather than shrinking the guarantee |
| **#2 — Reference device corrected from iPad Air M1 to iPad Air 4 (A14, 4 GB)**, tightening every performance budget | The M1 reference was an error, not a choice — the owner's device is the 4th-gen Air. A14 single-core is within roughly 10% of M1, so the 2s budget survives; **RAM is the real change**, 4 GB against 8 GB, which constrains how much can be held in memory during the buffered-write window and how large the JS heap may grow before the OS reclaims | **Keeping the M1 target and hoping** was rejected: SC-001 would then be validated on hardware the owner does not own, which makes the phase gate meaningless. **Relaxing the 2s budget to suit the A14** was also rejected — the budget comes from Principle I, not from hardware, and A14 is close enough that the existing mitigations (thin `_layout`, nothing blocking above first paint) should still carry it. Verification moves to the real device: `tests/perf/coldstart.ts` runs on the Air 4 or the number does not count |

**Note on N/A gates.** Nine of eighteen gates are N/A this phase. That is the phase boundary working
as intended, not a gap — the constitution's phase-gate rule deliberately keeps ranking, time, place,
regulation, stakes, and social scope out of phase 1. Each N/A becomes live in a later phase and should
be re-evaluated then rather than inherited as passing.
