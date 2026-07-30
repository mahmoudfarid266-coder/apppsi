# Quickstart & Validation: Capture & Companion Shell

**Feature**: `001-capture-companion-shell` · **Phase 1** · **Date**: 2026-07-30

How to run this feature and prove it meets its success criteria. Validation guide only —
implementation belongs in `tasks.md`.

---

## Prerequisites

| Requirement | Notes |
|---|---|
| Node 22 LTS + pnpm | |
| Expo SDK 57 tooling | `npx expo` — no global install needed |
| Docker Desktop | For `supabase start` locally. Free tier allows only 2 cloud projects, so local must be Docker |
| Supabase CLI | `supabase start` / `supabase db reset` |
| **iPad Air 4th gen (A14)** | The performance reference device for SC-001. Simulator timings do **not** satisfy SC-001. Note this is the *4th* gen — A14, 4 GB — not the M1 Air |
| EAS account | Cloud builds. No Mac required |
| Apple Developer Program | **Only needed for on-device installs via TestFlight.** Enrolment takes 24–48h+ — start it before you need it |

Local development uses Expo Go or a dev client. The widget (E2) cannot be validated in Expo Go and
requires a dev build.

## Setup

```bash
pnpm install
```

```bash
supabase start
```

```bash
supabase db reset
```

```bash
pnpm expo start --dev-client
```

Expected: app opens directly onto the capture screen with the keyboard raised. No sign-in prompt, no
onboarding wall you cannot skip, and a named companion visible after first use.

## Inspecting local data

Press `Shift + M` in the Expo CLI terminal to open the built-in `expo-sqlite` DevTools inspector —
browse `captures`, run queries, export the database. No separate Drizzle Studio dependency needed.

---

## Validation scenarios

Each maps to a success criterion in [spec.md](spec.md). Run in order; later ones assume the earlier
ones pass.

### V1 → SC-001, SC-002 · Cold launch and instant write

```bash
pnpm test:perf:coldstart
```

- Runs 100 cold launches via **both** E1 (app icon) and E2 (widget deep link), reported separately.
- **Pass**: ≥95/100 under 2.0s on the reference device, **for the E2 path** — the slower of the two.
- **Pass**: submitting a capture shows no spinner or placeholder in any run.
- **Fail diagnosis**: if E1 passes and E2 fails, the deep-link route is doing work above first paint.
  Check that nothing was added to `app/_layout.tsx`.

### V2 → SC-003, SC-004 · Nothing is ever lost

```bash
pnpm test:e2e -- offline-week
```

Simulates 7 days of airplane-mode capture, then reconnects.

- **Pass**: every capture succeeds while offline, remains visible throughout, and appears on a second
  client after reconnect.
- **Pass**: no capture requires any manual sync action.

```bash
pnpm test:e2e -- kill-mid-buffer
```

**The most important test in this feature.** Force-kills the process while a capture is in the
in-memory pending buffer and before the database has opened.

- **Pass**: the capture is present after relaunch.
- **If this test is flaky, do not weaken it.** Switch to the flat-file durability path held in reserve
  in `plan.md` Complexity Tracking #1. The guarantee is not negotiable; the mechanism is.

### V3 → SC-003 · Two devices, no overwrite

```bash
pnpm test:e2e -- two-device-union
```

Both clients offline, each captures distinct thoughts, both reconnect.

- **Pass**: the union of both sets is present on both clients.
- **Pass**: no capture from either device is missing, altered, or reordered away.
- **Pass**: two captures with *identical text* both survive — this verifies the deliberate absence of
  dedupe (`data-model.md`).

### V4 → FR-015b · The adopt path

```bash
pnpm test:domain -- reattribute
```

Pure-function tests, no simulator.

- **Pass**: rewriting local rows to a target id alters `user_id` and nothing else.
- **Pass**: a mid-rewrite failure rolls back entirely and leaves local data intact.

```bash
pnpm test:e2e -- signin-adopt
```

- **Pass**: signing into an account that already holds captures yields both histories in full, ordered
  by capture time.
- **Pass**: the person is told what happened afterwards (FR-015a) without being blocked.

### V5 → SC-006, SC-009 · No punishment mechanics

```bash
pnpm lint:copy
```

- **Pass**: no string in the catalogue matches the banned-pattern list in
  [contracts/companion-voice.md](contracts/companion-voice.md).
- **Pass**: no user-facing string literal exists outside the catalogue.

```bash
pnpm test:companion-states
```

- **Pass**: the companion state union is exactly `idle | attentive | acknowledging`. Adding any
  forbidden asset fails the build even if unreferenced.

```bash
pnpm test:e2e -- long-absence
```

Sets last-active 60 days back.

- **Pass**: companion appearance and language identical to a 1-day absence, given equal history.
- **Pass**: no count, duration, or summary of the gap is presented anywhere.

```bash
pnpm test:domain -- growth-monotonic
```

- **Pass**: growth stage never decreases as cumulative history grows.
- **Pass**: `growthStage` has no time or last-seen parameter in its signature.

### V6 → SC-005, SC-008 · Defaults and denial

```bash
pnpm test:e2e -- skip-everything
```

- **Pass**: skipping every onboarding step reaches a working capture screen in under 90s with no dead
  end.
- **Pass**: with notifications, microphone, and all other permissions denied and no account, every
  scenario in User Stories 1, 2, and 4 completes.

### V7 → FR-025 · Personality off

```bash
pnpm test:components
```

The component suite runs twice, once per personality mode.

- **Pass**: every assertion passes in both modes. Plain mode is a supported path, not a degraded one.

### V8 → Gate 14, NFR-19 · Cross-user isolation

```bash
supabase test db
```

- **Pass**: user B reads zero rows of user A's data across every table, enumerated from
  `information_schema`.
- **Pass**: a table added without RLS policies **fails** this test. Verify by temporarily adding one.

### V9 → FR-016 · Storage exhaustion

Manual, on-device. Fill device storage, then capture.

- **Pass**: an explicit message appears. This is the one place in the feature where a loud failure is
  correct — a silent drop here breaks the product's core promise.

### V10 → FR-035, FR-036 · Accessibility

```bash
pnpm test:a11y
```

- **Pass**: WCAG 2.2 AA contrast on every screen; every interactive element labelled; targets ≥48pt;
  largest text size renders without clipping.
- **Pass**: with Reduce Motion on, all animation is 0ms — **including the companion**.

---

## Full gate

```bash
pnpm verify
```

Runs domain tests, component tests (both modes), copy lint, companion-state assertion, RLS test, and
a11y checks. CI runs the same command, so a green local `verify` means a green build.

The e2e and perf suites are run separately because they need a device.

---

## The real phase gate

Every check above can pass while the feature still fails, because the one criterion that matters is
not automatable:

> **SC-007 — you use the app for capture every day for 7 consecutive days without reverting to your
> old tool.**

Work on phase 2 does not begin until that is true. This is the constitution's phase-gate rule, and it
is the rule most likely to be quietly skipped. If you find yourself reaching for Notes or a text
message to yourself instead of this app, that is the signal — and the correct response is to fix
capture, not to start building the next phase.
