# Tasks: Capture & Companion Shell

**Input**: Design documents from `/specs/001-capture-companion-shell/`

**Prerequisites**: [plan.md](plan.md) · [spec.md](spec.md) · [research.md](research.md) ·
[data-model.md](data-model.md) · [contracts/](contracts/) · [quickstart.md](quickstart.md) ·
[design-system/MASTER.md](../../design-system/MASTER.md)

**Tests**: Included. Test-first is required for `src/domain/` by constitution Principle IX, and the
two build-time enforcement checks from research R5 are in scope for this phase — they are how
FR-021/023/024/031 become verifiable rather than aspirational.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: US1–US4, mapping to the user stories in spec.md

## Path Conventions

Mobile app + managed backend, per plan.md: `app/` (routes) · `src/` (domain, systems, companion, db,
sync, ui, lib) · `supabase/` · `tests/`

---

## Phase 1: Setup

**Purpose**: Project initialization. Nothing here is feature work.

- [ ] T001 Initialize Expo SDK 57 + TypeScript project at repo root, with `app/`, `src/`, `tests/` per plan.md Project Structure
- [ ] T002 Install core dependencies in `package.json`: `expo-router`, `expo-sqlite`, `drizzle-orm`, `nativewind@4`, `zustand`, `expo-speech-recognition`, `@supabase/supabase-js`, `uuidv7`
- [ ] T003 [P] Configure Metro in `metro.config.js` — add `sql` to `resolver.sourceExts` for Drizzle migrations
- [ ] T004 [P] Configure Babel in `babel.config.js` — `inline-import` plugin for `.sql`, NativeWind preset
- [ ] T005 [P] Configure Drizzle in `drizzle.config.ts` — `dialect: 'sqlite'`, `driver: 'expo'`
- [ ] T006 [P] Configure testing: `vitest.config.ts` for `tests/domain/` (pure, no simulator) and `jest.config.js` with `jest-expo` for `tests/components/`
- [ ] T007 [P] Bundle Space Grotesk (700) into `assets/fonts/` and register in `app/_layout.tsx` — bundled, not fetched, per design-system §2
- [ ] T008 [P] Configure ESLint + Prettier with LF enforcement in `.eslintrc.cjs` and `.prettierrc`
- [ ] T009 [P] Create `eas.json` with `development`, `preview`, `production` profiles
- [ ] T010 [P] Create `.env.local.example` at repo root documenting required keys; confirm `.env.local` is listed in `.gitignore`
- [ ] T011 Scaffold `.github/workflows/ci.yml` with empty jobs for: domain tests, copy lint, companion-state assertion, RLS test, a11y

**Checkpoint**: `pnpm expo start` launches a blank app. No feature behaviour yet.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infrastructure every user story depends on.

**⚠️ CRITICAL**: No user story work begins until this phase completes. T014 and T016 in particular
must exist *before* any user-facing string or companion asset is written, or they cannot enforce
anything retroactively.

### Design system

- [ ] T012 Implement design tokens in `src/ui/tokens.ts` from design-system/MASTER.md §1 — palette A light (`--paper #FDF4EC`, `--ink #450920`, `--accent #A53860`) and dark (`--paper #24050F`, `--ink #F9DBBD`, `--accent #FFA5AB`). **The accent swaps swatch between themes — it is not a tint adjustment**
- [ ] T013 [P] Implement theme provider in `src/ui/ThemeProvider.tsx` — follows system appearance, Settings override, exposes tokens via NativeWind
- [ ] T014 Create the copy catalogue at `src/ui/copy.catalogue.ts` — **every** user-facing string lives here, nowhere else
- [ ] T015 [P] Implement type scale in `src/ui/type.ts` — Space Grotesk ≥24pt display, system face below, per design-system §2
- [ ] T016 Create the companion state manifest at `src/companion/states.manifest.ts` as a closed union: `idle | attentive | acknowledging`
- [ ] T017 [P] Implement motion tokens in `src/ui/motion.ts` — every duration resolves to 0ms when Reduce Motion is enabled
- [ ] T018 [P] Build primitives in `src/ui/`: `Pill.tsx` (full-width ink button, 56pt), `Field.tsx` (2px ink underline, 22pt input), `Divider.tsx`. All targets ≥48pt

### Build-time enforcement (research R5)

- [ ] T019 Write the copy lint at `scripts/lint-copy.ts` — fails the build on any catalogue string matching the banned-pattern list in contracts/companion-voice.md (money, shame, urgency, counts-of-not-done, absence references, `!` in companion voice)
- [ ] T020 Write the second copy check in `scripts/lint-copy.ts` — fails on any user-facing string literal outside the catalogue, so the first check cannot be bypassed by inlining
- [ ] T021 [P] Write the companion state assertion at `tests/components/companion-states.test.ts` — asserts the manifest union is exactly the permitted set. **An unused `sad` asset must still fail the build**
- [ ] T022 Wire T019, T020, T021 into `.github/workflows/ci.yml`

### Data layer

- [ ] T023 Implement Drizzle schema in `src/db/schema.ts` — `captures`, `profiles`, `companions`, `media_assets` per data-model.md §4, with `original_text` immutable-after-insert and **no** unique constraint on content
- [ ] T024 Create local migration in `src/db/migrations/0001_init.sql`; enable WAL
- [ ] T025 [P] Create Postgres migration in `supabase/migrations/0001_capture_companion.sql` — `global_rev` sequence, `touch_row()` trigger, the four tables, indexes per data-model.md §7
- [ ] T026 Add default-deny RLS + four explicit policies per table in `supabase/migrations/0002_rls.sql`
- [ ] T027 Write the cross-user isolation test in `supabase/tests/rls.test.sql` — enumerate tables from `information_schema` so a future table without policies fails the build (NFR-19)
- [ ] T028 Mark the SQLite file `NSURLIsExcludedFromBackupKey` in `src/db/client.ts` — PHI never reaches iCloud

### The cold-launch path (research R2)

- [ ] T029 Implement the in-memory pending buffer in `src/db/buffer.ts` — accepts writes before the DB is open, drains on first tick after open and on background transition
- [ ] T030 Implement the thin root layout at `app/_layout.tsx` — **nothing blocking above the capture route.** DB open, migrations, session restore, and sync all initialise *after* first paint
- [ ] T031 [P] Add cold-launch instrumentation in `src/lib/perf.ts` — native process-start timestamp exposed to JS, first-keystroke timestamp recorded

### iPad layout foundations

*Added 2026-07-30 after the reference device was corrected from iPad Air M1 to iPad Air 4. IDs
continue from the end of the list to avoid renumbering; these tasks execute here, in Phase 2.*

- [ ] T084 Implement the size-class hook in `src/ui/useSizeClass.ts` — resolves `compact | narrow | medium | wide | widest` from window width per design-system §3b
- [ ] T085 Implement the centred content column in `src/ui/ContentColumn.tsx` — `--content-max: 620pt`, minimum 48pt gutters. **Nothing spans full width at 1180pt**
- [ ] T086 [P] Make the type scale size-class aware in `src/ui/type.ts` — hero 36/44/52pt by class, field input 20/22/24pt
- [ ] T087 [P] Constrain `Pill.tsx` to the column width, never the screen width
- [ ] T088 Enable all four orientations and Split View in `app.config.ts` — `supportsTablet: true`, `requiresFullScreen: false`, no orientation lock

**Checkpoint**: tokens, catalogue, manifest, schema, RLS, buffer, and the responsive column all
exist, and CI enforces the two R5 checks. User story work can begin.

---

## Phase 3: User Story 1 — Get the thought out before it's gone (P1) 🎯 MVP

**Goal**: Cold launch to typing in under 2s, zero required fields, no perceptible write delay.

**Independent test**: Launch cold, type a thought, confirm it is retained and visible afterwards.
Delivers value with no other story implemented.

### Tests first

- [ ] T032 [P] [US1] Write failing domain tests in `tests/domain/capture-ordering.test.ts` — stable ordering across clock changes and timezone crossings, falling back to uuidv7 id order
- [ ] T033 [P] [US1] Write the cold-launch harness at `tests/perf/coldstart.ts` — 100 runs, reports E1 (icon) and E2 (widget deep link) separately, asserts ≥95 under 2.0s on the E2 path

### Domain

- [ ] T034 [US1] Implement `src/domain/capture/ordering.ts` to pass T032 — pure, no I/O, time injected

### Capture path

- [ ] T035 [US1] Implement the capture route at `app/index.tsx` as the initial route — field mounted and focused on first paint, no provider blocks it
- [ ] T036 [US1] Implement the capture write in `src/systems/quests/capture.ts` — buffer write → acknowledge → SQLite insert + outbox append in one transaction
- [ ] T037 [US1] Wire submit in `app/index.tsx` to clear the field and stay put, no navigation (FR-004)
- [ ] T038 [P] [US1] Implement draft persistence in `src/systems/quests/draft.ts` — survives interruption, backgrounding, and termination (FR-006)
- [ ] T039 [P] [US1] Implement voice capture in `src/systems/quests/voice.ts` — on-device transcription, audio retained as a `media_asset`, degrades to text entry when the mic is denied (FR-005)
- [ ] T040 [P] [US1] Implement explicit storage-exhaustion handling in `src/systems/quests/capture.ts` — the one place in the feature that surfaces a loud failure (FR-016)

### Widget (research R1)

- [ ] T041 [US1] Register the `rudder://` scheme and `rudder://capture` / `rudder://inbox` deep links in `app.config.ts` per contracts/app-entry-points.md
- [ ] T042 [US1] Build the home-screen widget in `plugins/withCaptureWidget.ts` as a **static render plus one deep link** via the Expo config plugin — **no text field, no count, no dynamic content.** Widgets cannot host text input, and a count on the home screen violates FR-031
- [ ] T043 [US1] Verify the deep-link cold path meets the 2s budget using T033; if it fails, the fix is in `app/_layout.tsx`, not the widget

**Checkpoint**: capture works end to end from both entry points. This alone is a usable daily driver.

---

## Phase 4: User Story 2 — Trust that nothing is ever lost (P2)

**Goal**: Works offline indefinitely; two devices produce the union, never the intersection.

**Independent test**: Disable connectivity, capture for several days, reconnect, confirm every item
appears on a second device.

### Tests first

- [ ] T044 [P] [US2] Write failing domain tests in `tests/domain/reattribute.test.ts` — rewriting local rows to a target id alters `user_id` and nothing else; a mid-rewrite failure rolls back entirely
- [ ] T045 [P] [US2] Write the offline-week e2e at `tests/e2e/offline-week.yaml` (Maestro) — 7 days of airplane-mode capture, then reconnect
- [ ] T046 [P] [US2] Write the kill-mid-buffer e2e at `tests/e2e/kill-mid-buffer.yaml` — **force-kills the process while a capture sits in the pending buffer.** This is the test that guards Complexity Tracking #1
- [ ] T047 [P] [US2] Write the two-device union e2e at `tests/e2e/two-device-union.yaml` — includes two captures with *identical text*, both of which must survive

### Domain

- [ ] T048 [US2] Implement `src/domain/identity/reattribute.ts` to pass T044 — pure function, no I/O in the signature

### Sync

- [ ] T049 [US2] Implement the outbox in `src/sync/outbox.ts` per contracts/sync-protocol.md — insert and outbox append in one transaction; `attempts` is diagnostic and **never triggers discard**
- [ ] T050 [US2] Implement the drain worker in `src/sync/drain.ts` — exponential backoff, unbounded retry, upsert keyed on `id`, `original_text` written only on first insert
- [ ] T051 [US2] Implement the puller in `src/sync/puller.ts` — cursor advances only after successful local application; a pulled row never deletes a local row
- [ ] T052 [P] [US2] Implement conflict rules in `src/sync/conflict.ts` — LWW on the three mutable fields only; **no merge algorithm for captures**, no dedupe

### Auth and the two sign-in paths (research R3)

- [ ] T053 [US2] Implement anonymous sign-in and local-only mode in `src/lib/auth.ts` — the app is fully usable before any account exists (FR-014)
- [ ] T054 [US2] Implement the **upgrade** path in `src/lib/auth.ts` — link email/OAuth identity. The user id persists, so **no data operation runs**
- [ ] T055 [US2] Implement the **adopt** path in `src/lib/auth.ts` — transactional local re-attribution, rows enqueued as **inserts not upserts**, cursor reset to 0. All of FR-015b's risk lives here
- [ ] T056 [P] [US2] Implement the post-merge notice using `copy.catalogue.ts` key `merged.1` — plain, unmissable, non-blocking (FR-015a)
- [ ] T057 [P] [US2] Implement offline export in `src/systems/quests/export.ts` — JSON + CSV + audio manifest, no network (FR-017)

**Checkpoint**: nothing can be lost. The trust guarantee holds.

---

## Phase 5: User Story 3 — Something is there with you (P3)

**Goal**: A named crow, present, whose state cannot encode absence or failure.

**Independent test**: Complete first use, name it, leave the app 60 days, confirm appearance and
language are unchanged in character with no reference to the gap.

### Tests first

- [ ] T058 [P] [US3] Write failing domain tests in `tests/domain/companion-growth.test.ts` — monotonic across all histories; **assert the signature accepts no time, `now`, or last-seen parameter**
- [ ] T059 [P] [US3] Write the long-absence e2e at `tests/e2e/long-absence.yaml` — last-active 60 days back; state identical to 1 day, no count or duration shown

### Domain

- [ ] T060 [US3] Implement `src/domain/companion/growth.ts` to pass T058 — `growthStage(history: { captureCount })`. Inactivity cannot influence it because the function cannot observe it

### Companion

- [ ] T061 [US3] Draw the crow as flat SVG silhouettes in `src/companion/assets/` — `idle`, `attentive`, `acknowledging` only, in `--ink`. No other state may exist in the directory
- [ ] T062 [US3] Implement the companion component in `src/companion/Companion.tsx` — never rendered in `--accent` or `--destructive`; honours Reduce Motion with no hero exemption
- [ ] T063 [US3] Populate the 12 voice strings in `src/ui/copy.catalogue.ts` per contracts/companion-voice.md — arrival, capture-held, empty, merged. Must pass T019
- [ ] T064 [P] [US3] Implement personality-off mode in `src/companion/Companion.tsx` and the catalogue's plain replacements (FR-025)
- [ ] T065 [US3] Configure `tests/components/` to run the full suite twice, once per personality mode — plain mode is a supported path, not a degraded one

**Checkpoint**: the companion exists and cannot shame the user by construction.

---

## Phase 6: User Story 4 — Come back to a pile without dread (P4)

**Goal**: 40 unreviewed captures induce no dread. No oldest-first, no overdue, no penalty.

**Independent test**: Seed many captures of varied ages; confirm no pressure framing anywhere.

- [ ] T066 [US4] Implement the inbox route at `app/inbox.tsx` — **ordering must not default to oldest-first** (FR-027)
- [ ] T067 [US4] Implement inbox queries in `src/systems/quests/queries.ts` — no query may mark a capture overdue, late, or stale
- [ ] T068 [P] [US4] Implement the neutral count in `app/inbox.tsx` — `--ink-muted`, never a badge, never accent (FR-028)
- [ ] T069 [P] [US4] Implement the empty state in `app/inbox.tsx` using catalogue key `empty.1` — sufficiency, never "0 items" (FR-029)
- [ ] T070 [US4] Implement capture editing in `src/systems/quests/edit.ts` — writes `edited_text`, leaves `original_text` intact and recoverable (FR-012)
- [ ] T071 [US4] Implement discard and 30-day recovery in `src/systems/quests/discard.ts` (FR-013)
- [ ] T072 [US4] Implement the destructive-confirm dialog in `src/ui/ConfirmDelete.tsx` — the **only** surface permitted `--destructive #9D0208`, **outlined never filled**, per design-system §6
- [ ] T073 [P] [US4] Write the inbox pressure audit at `tests/components/inbox-neutrality.test.tsx` — asserts no red, no overdue marker, no aggregate of things not done

**Checkpoint**: all four stories complete. The feature is whole.

---

## Phase 7: Polish & Cross-Cutting

- [ ] T074 Implement onboarding at `app/onboarding/` — 6 screens, every step skippable, working screen in under 90s, no dead end (FR-032)
- [ ] T075 [P] Implement per-permission requests in `src/lib/permissions.ts`, each framed by what it does and requested at the point of use; app stays fully functional if all are denied (FR-033)
- [ ] T076 [P] Write the skip-everything e2e at `tests/e2e/skip-everything.yaml` (SC-005, SC-008)
- [ ] T077 [P] Implement Sentry with `beforeSend` scrubbing in `src/lib/sentry.ts` — strips capture text, audio refs, and companion name
- [ ] T078 [P] Write the scrubbing assertion at `tests/lib/sentry-scrub.test.ts` — enforced by test, not convention (NFR-11)
- [ ] T079 Write the a11y suite at `tests/a11y/` — WCAG AA contrast **per theme independently**, VoiceOver labels, ≥48pt targets, Dynamic Type to XXL without clipping
- [ ] T080 [P] Verify Reduce Motion resolves every token to 0ms, companion included, in `tests/a11y/reduce-motion.test.ts`
- [ ] T081 [P] Add the `pnpm verify` aggregate script to `package.json` — domain tests, component tests (both modes), copy lint, state assertion, RLS test, a11y
- [ ] T082 Run the full quickstart.md validation set V1–V10 and record results
- [ ] T083 Validate the native config by running the `.github/workflows/ipa.yml` workflow — **`expo prebuild --platform ios` cannot run on Windows** (it requires macOS or Linux), so config-plugin errors only surface on the macOS runner. Needs no Apple account

### iPad validation

- [ ] T089 Write the size-class snapshot suite at `tests/components/size-classes.test.tsx` — capture and inbox render correctly at 320 / 375 / 590 / 820 / 1180pt with no horizontal scroll and no full-bleed content
- [ ] T090 [P] Write the orientation + multitasking e2e at `tests/e2e/ipad-multitasking.yaml` — rotate through all four orientations and resize Split View mid-draft; **draft text must survive the resize** (FR-006)
- [ ] T091 [P] Implement hardware-keyboard handling in `app/index.tsx` — field focused on launch, `Return` commits and keeps focus, `Shift+Return` newline, `Escape` clears
- [ ] T092 [P] Write the hardware-keyboard e2e at `tests/e2e/hardware-keyboard.yaml` — a full capture completed with **zero taps**
- [ ] T093 Run `tests/perf/coldstart.ts` on the physical iPad Air 4 — simulator numbers do not satisfy SC-001

### Getting an installable build

> ⛔ **T094 is a hard external blocker.** There is no free path to an `.ipa` that runs on a physical
> iPad — Apple requires a paid account for the code signing and provisioning that a device install
> needs. Cloud builders remove the Mac requirement, not the enrolment requirement.

- [ ] T094 **Enrol in the Apple Developer Program** ($99/yr). Approval takes 24–48h+ and blocks T095–T098. **Start this before writing code — it is the only item on the list with an external clock**
- [ ] T095 Verify the app name in App Store Connect and register the bundle identifier
- [ ] T096 Register the iPad Air 4's UDID as a development device in the Apple Developer portal
- [ ] T097 Run `eas build --profile development --platform ios` and let EAS manage credentials
- [ ] T098 Install the resulting build on the iPad Air 4 and begin the SC-007 seven-day run

**Checkpoint**: `pnpm verify` green, quickstart validated, build installed on the actual device.

---

## Dependencies

```
Phase 1 (Setup)
    │
Phase 2 (Foundational)  ◄── BLOCKING. T014/T016 must precede any string or asset.
    │
    ├─────────────┬─────────────┬─────────────┐
    ▼             ▼             ▼             ▼
Phase 3 (US1)  Phase 4 (US2) Phase 5 (US3) Phase 6 (US4)
  MVP            needs US1      independent   needs US1
                 (captures                    (captures
                  to sync)                     to review)
    └─────────────┴─────────────┴─────────────┘
                        │
                  Phase 7 (Polish)
```

- **US1 → US2** and **US1 → US4**: both need captures to exist.
- **US3 is independent** of US1/US2/US4 once Phase 2 is done — it can be built in parallel by a
  second worker.
- **T029 (buffer) blocks T036**, and T046 is the test that justifies the buffer's existence.
- **T012 (tokens) blocks every UI task.**

## Parallel opportunities

| Batch | Tasks | Note |
|---|---|---|
| Setup config | T003–T010 | All different files |
| Foundational | T013, T015, T017, T018 · T021 · T025 | Design and data layers don't overlap |
| US1 tests | T032, T033 | Written before implementation |
| US1 features | T038, T039, T040 | Draft, voice, storage — separate modules |
| US2 tests | T044–T047 | All four are separate files |
| US3 whole phase | T058–T065 | Parallel with US2 entirely |
| Polish | T075–T081 | Mostly independent |

## Implementation strategy

**MVP = Phase 1 + Phase 2 + Phase 3 (US1).** That is 43 tasks and yields a working capture app —
which by SC-007 is the thing you actually have to use daily for a week.

Then US2 (trust), then US3 (companion) and US4 (inbox) in either order, then polish.

**Do not skip T046.** The kill-mid-buffer test is the only thing standing between the pending-buffer
optimisation and a silent violation of Principle I. If it proves flaky, adopt the flat-file
durability path held in reserve in plan.md rather than weakening the assertion.

**The real gate is SC-007, not this list.** All 83 tasks can be complete while the feature still
fails, because the criterion that matters is whether you reach for this app instead of Notes for
seven consecutive days. Phase 2 of the roadmap does not begin until that is true.
