# Contract: App Entry Points

**Feature**: `001-capture-companion-shell` · **Phase 1** · **Date**: 2026-07-30

Every way a capture can begin, and the guarantee each one carries. Per FR-008/008a, this phase ships
exactly two capture surfaces.

---

## Shipping this phase

| # | Entry point | Mechanism | Guarantee |
|---|---|---|---|
| **E1** | Inside the app | Capture screen is the initial route | Input focused on first paint. < 2s from cold launch (FR-002) |
| **E2** | Home-screen widget | Deep link → cold or warm launch onto the capture route | Same 2s threshold, measured from the widget tap (FR-008) |
| **E3** | Voice, within E1 or E2 | Hold-to-talk on the capture screen | On-device transcription; audio retained; degrades to text if mic denied (FR-005) |

E3 is a mode of the capture screen rather than a separate entry point, but it is listed because it has
its own permission path and its own failure mode.

## Explicitly not shipping (FR-008a)

Deferred, not rejected. Each is a later phase.

| Entry point | Why deferred |
|---|---|
| Control Center control | Additional platform surface; no capture value beyond E2 until a no-launch capture path exists |
| Siri / App Intent phrase | Genuinely valuable for hands-busy capture, but a separate integration to debug before the phase gate is met |
| Share sheet from other apps | The largest of the four, and the least connected to the core premise |

---

## The widget contract

**Critical constraint (R1): a WidgetKit widget cannot contain a text field.** Widgets are static
snapshots in a separate extension process; interactivity is limited to `Button` and `Toggle` backed by
an `AppIntent`, and there is no keyboard or first responder available. The widget therefore **cannot
capture**. It can only launch.

```
┌─────────────────────┐
│  [companion glyph]  │   ← static render, no data from captures
│                     │
│  Capture a thought  │   ← entire surface is one deep link
└─────────────────────┘
          │ tap
          ▼
   rudder://capture
          │
          ▼
   app cold-launches onto capture route, keyboard raised
```

Requirements:
- The widget body renders **no capture content** — not counts, not recent text, not "3 unreviewed".
  A count on the home screen is a count of things not done (FR-031), on the most visible surface the
  person owns.
- The widget must render identically regardless of history or absence (FR-020, FR-022).
- No timeline refresh is needed, because the widget displays nothing dynamic. This also means zero
  background budget consumption.
- **No Swift widget target is required this phase.** Because the widget is purely a static render plus
  a link, it is achievable through the Expo config plugin path without hand-written extension logic.
  The Swift/WidgetKit work stays deferred as `VISION.md` assumed.

## Deep-link scheme

| URL | Behaviour |
|---|---|
| `rudder://capture` | Open capture route, focus input, raise keyboard |
| `rudder://inbox` | Open review list |

Rules:
- A deep link must never present onboarding to an already-onboarded person, and must never lose the
  intent if onboarding *is* required — the capture route is restored after first use completes.
- An unrecognised link opens the capture route rather than an error. There is no dead end (FR-032).
- Deep links accept **no capture content as a parameter** this phase. A URL-borne capture would be an
  unaudited write path, and URLs get logged in places the app does not control.

## The cold-launch budget

E2 makes cold launch the common path, not the exception, so the budget applies to it in full.

| Stage | Budget | Notes |
|---|---|---|
| Process start → JS bundle loaded | ~0.9s | Hermes; minimal initial-route dependency graph |
| JS start → first paint | ~0.4s | Thin `_layout`; **no provider may block** |
| First paint → input focused | ~0.2s | Focus requested in the same frame as mount |
| **Total → first keystroke possible** | **< 2.0s** | FR-002, SC-001 (95/100 attempts) |

Budget is stated for the **iPad Air 4th gen (A14, 4 GB)**. A14 single-core sits within roughly 10% of
M1, so the split above holds; the 4 GB ceiling is the tighter constraint and bounds how much the JS
heap and pending buffer may hold before the OS reclaims.

Deliberately **outside** this path, running after first paint:

- opening SQLite and running migrations
- session restore and auth refresh
- outbox drain and pull
- companion asset load and growth-stage derivation
- speech-recognition module init

This is R2's decision made concrete: the person can be typing before any of the above has finished,
and the pending buffer is what makes that safe.

## Measurement contract

SC-001 requires 95 of 100 attempts under 2s, which is not measurable by hand.

- A native timestamp is captured at process start and exposed to JS.
- The capture input records a timestamp on its first keystroke.
- The delta is logged in development builds and asserted by `tests/perf/coldstart.ts`.
- The harness runs cold launches via both E1 and E2, reported separately — **E2 is expected to be the
  slower path** and is the one that must pass.
