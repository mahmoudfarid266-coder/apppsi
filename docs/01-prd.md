# Rudder — Product Requirements

**Version 2.0** · rewritten 2026-07-29 against constitution v2.0.0 and `VISION.md`.
Supersedes the four-pillar v1.0 PRD.

Format: `FR-<system>.<n>` = functional requirement · `NFR-<n>` = non-functional.

**Priority:**
| | Meaning |
|---|---|
| **P0** | v1 blocker. The app is not shippable without it |
| **P1** | v1 should-have. Ships in v1 if phase gates allow |
| **P2** | Post-v1 |
| **P3** | Blocked on other humans, a legal entity, or licensing. Not designed into the v1 data model |

**Systems:** 1 Companion · 2 Quests · 3 Rhythms · 4 Regulation · 5 Bonds · 6 Solitude · 7 Record ·
8 Stakes · 9 Surfaces.

Every requirement below occupies a stage of the loop: **SENSE → DECIDE → OFFER → DO → MARK →
SETTLE**. The stage is named on each requirement. A requirement with no stage does not belong here.

---

## 0. Cross-cutting

### FR-0.1 Onboarding — P0 · *OFFER*
Max 6 screens, skippable at every step, total < 90 seconds.

1. "What breaks most often for you?" — multi-select over the nine failure modes. Sets initial scorer weights.
2. Meet the companion: name it, pick it. One screen, no customisation depth.
3. Meds? yes/no → if yes, name + times (skippable).
4. Typical energy curve — three taps (morning / afternoon / evening: low/med/high).
5. Permissions, each framed by *what it will do*, requested one at a time and never as a wall:
   notifications ("I'll tell you when to leave"), location ("I'll remember what you wanted to do near places you go" — explicitly optional).
6. Dump three things on your mind → these become the first three inbox items.

**Acceptance:** a user who taps "skip" on every screen lands on a functional home screen with a named
companion and sensible defaults. No dead ends. Denying every permission still yields a working app.

### FR-0.2 Low-stim mode — P0 · *OFFER*
Global toggle + honours OS `Reduce Motion`, `Reduce Transparency`, `Increase Contrast`, Dynamic Type.
When on: no gradients, no parallax, no confetti, no animated transitions > 120ms, mono accent colour.
**Applies to the companion with no exception** — the companion's idle animation, reactions, and
transitions all collapse to static states.

### FR-0.3 Adaptive stimulation — P1 · *SENSE → OFFER*
The interface adapts to declared or inferred arousal state in **both** directions:

| State | UI response |
|---|---|
| Overstimulated | Collapse to one action. Mono palette. Zero motion. Notifications suppressed except meds and active timers |
| Baseline | Normal |
| Understimulated / stuck | Higher-contrast accents, motion permitted, quest framing foregrounded, variable-reward reveal enabled |

**Rationale:** neurodivergent users need a calm minimal interface when overstimulated and *more*
engagement when understimulated. Shipping only the calm direction solves half the problem.

**Acceptance:** adaptation requires zero configuration. The user declares state in one tap; the app
never asks them to tune the response.

### FR-0.4 Data export — P0 · *MARK*
Export all user data as a single JSON file + CSV bundle from Settings. Must work offline. Includes
media manifest for voice notes and photos. Required for App Store privacy compliance and for the
"I'm leaving" exit path.

### FR-0.5 Account & auth — P0
Sign in with Apple (required by App Review if any other social login exists) + email magic link.
Anonymous/local-only mode for first launch: the app is fully usable before signing in; account
creation upgrades local data via Supabase anonymous-user linking.

### FR-0.6 Notification engine — P0 · *OFFER*
A single scheduler owns every notification. Rules:
- Hard cap **6/day** default, user-adjustable 0–12. The cap is enforced across all seven systems —
  systems do not get individual budgets.
- Every notification carries an action, never bare information.
- Quiet hours default 22:00–07:00, honoured for everything except active timers and med alarms.
- Timer, transition, and **geofence** alerts are **local** notifications (must fire offline).
- Digests and non-time-critical nudges are push.
- **No notification may reference a stake, an amount, or a settlement** (Principle XI).

### FR-0.7 Gamification — P1 · *SETTLE*

> **Owner decision, 2026-07-30: the game layer is visible.** XP and level appear on the main surface,
> against the recommendation on record. It ships in the one shape compatible with Principle IV, stated
> as FR-0.7b below.

- Soft currency for *completed* actions and *logged* focus minutes. Never for opening the app. No cash
  value, not purchasable, not convertible (Principle X).
- Spends on: companion cosmetics, quest rerolls, map cosmetic unlocks. Nothing functional is
  paywalled behind it.
- **Variable reward is permitted and encouraged** — the reveal on completion is non-deterministic
  within a bounded, always-positive range. There is no "bad pull". Variable reward is the documented
  mechanism that survives novelty burnout; a fixed reward schedule does not.
- **Streak Repair:** a gap shows as "paused", never "lost". One completed task within 72h restores it.

### FR-0.7a Streak de-emphasis — P0
Streak *prominence* MUST decrease as streak length grows. At ≥30 days the number is not displayed on
the home surface at all, only in Record. **This requirement is not weakened by FR-0.7b.**

**Rationale:** streak anxiety scales with streak length — the longer it runs, the more a miss costs,
and the "what-the-hell effect" converts one miss into abandonment. A streak the user cannot see
cannot be feared.

### FR-0.7b Visible game layer — P1

> **The governing distinction: a number that can only rise may be visible. A number that can fall may
> not.**

Permitted on the main surface:
- **XP total** — MUST be monotonic. No path may decrease it.
- **Level** — MUST be monotonic. No level-down exists.
- **Progress to the next level**, rendered as a **filling** track. It fills; it never drains.
- **Reveal on completion** per FR-0.7 — bounded, always positive.

Prohibited, regardless of this decision:
- XP loss, decay, or expiry; level-down or rank demotion
- HP, hearts, or any depleting resource *(named in the research as an anxiety trigger)*
- Progress phrased as a shortfall — "40 XP to go" states the same fact as a deficit and is banned
  while "340 XP, next at 400" is permitted
- Leaderboards, ranks, or comparison to any other person
- Any total of things not done (FR-031)
- **Streaks are exempt from this requirement** and continue to follow FR-0.7a in full. A streak is the
  one number in the product that can *break*, which is precisely why it may not gain prominence.

**Presentation:** XP and level render in `--ink` and `--sunken` per `design-system/MASTER.md` §6.
Never in `--accent`, never in `--destructive`. **The companion never narrates XP** — it is not a
scorekeeper (Principle XI). Numbers appear as plain labels beside it, in system voice.

**Acceptance:** a property test asserts XP and level are non-decreasing across every possible event
sequence, including task deletion, account merge, and sync conflict resolution.

### FR-0.8 Re-entry flow — P0 · *OFFER*
If `last_active > 72h`, home shows a Re-entry card instead of the normal offer:
> "You've been away 9 days. Nothing is overdue — I paused it all. Here's one small thing."

All date-based overdue state is suppressed. Live stakes are already auto-suspended (FR-8.6). A single
easy action is offered. No counts, no red, no summary of what was missed.

**Rationale:** ~50% of habit-app users are gone by day 60 and ~75% by day 90. Re-entry is the single
highest-leverage retention surface in the product, and it is the one every competitor gets wrong.

---

## 1. Companion

The companion is the OFFER stage. It is the app's only voice.

### FR-1.1 Companion presence — P0 · *OFFER*
- Persistent on the Now surface. Named by the user at onboarding, renameable.
- Idle, attentive, and acknowledging states. **No sad, sick, neglected, disappointed, or hungry
  state exists in the asset set** — not as an unused asset, not behind a flag (Principle IV).
- Growth is a pure function of **cumulative** contribution. It MUST NOT read current streak, recent
  compliance, or time since last open.

**Acceptance:** an automated test asserts that companion visual state is identical after 1 day away
and after 60 days away, given equal cumulative history.

### FR-1.2 Companion voice — P0 · *OFFER*
Copy rules, enforced by a lint rule over the string catalogue:
- Warm, dry, brief. No exclamation marks in system copy. No emoji in companion speech.
- **Never** shames, guilts, expresses disappointment, or frames a lapse as a loss.
- Narrates **patterns**, never **incidents**: "third Tuesday in a row" is permitted; "you didn't do
  it today" is not.
- **Never** references money, stakes, amounts, or settlement (Principle XI).
- Never manufactures urgency it has no grounds for.

**Acceptance:** a CI test fails the build on any string in the catalogue matching the banned-pattern
list (currency symbols, "failed", "lost", "you should have", "don't forget", "!").

### FR-1.3 The one card — P0 · *OFFER*
The Now surface shows exactly one action with exactly three affordances:
**Do it** · **Not now** · **Something else**.

- "Not now" opens a snooze picker with the app's suggestion pre-selected.
- "Something else" returns the next-ranked candidate. It does not open a list.
- The card names the system the action came from only via a small, non-colour glyph.

### FR-1.4 Shadow-teacher observations — P1 · *SENSE → OFFER*
Periodic, low-frequency pattern observations drawn from Record, surfaced at most **twice a week**:
> "You've moved 'call the landlord' eleven times. Want me to cut it up instead?"

Rules: pattern-level only; always paired with an offered action; never a bare judgement; suppressible
permanently in one tap; never delivered during a declared overstimulation state.

### FR-1.5 Companion off-switch — P1
The companion's personality layer can be reduced to plain-text prompts in Settings without losing any
function. **Acceptance:** every P0 flow completes with personality disabled.

---

## 2. Quests

Tasks, errands, and side quests. Place is a first-class trigger, not an add-on.

### FR-2.1 Frictionless capture — P0 · *SENSE*
Entry points, all landing in one `captures` inbox:

| Entry point | Interaction |
|---|---|
| App home | Persistent capture bar, focused on tap, one field |
| Home Screen widget | Taps straight into capture with keyboard up |
| Control Center | iOS control (18+) |
| Siri / Shortcuts | "Add to Rudder: …" App Intent |
| Share sheet | URL / text / screenshot from any app |
| Voice | Hold mic → on-device transcription; audio retained |

**Acceptance:** cold launch to first typed character < 2.0s on the reference device (iPad Air 4th gen, A14). Zero required fields.
Enter saves and clears without leaving the screen. Local write < 50ms with no network in the path.

### FR-2.2 AI triage — P1 · *SENSE*
Captures are enriched asynchronously, server-side, batched: classify (`task`/`idea`/`note`/`event`/
`shopping`/`question`), extract cleaned title, natural-language date, duration estimate, energy
required, context tag, project match, **and candidate place**. Below-threshold confidence leaves the
item in the inbox unmoved.

**Degradation:** offline or AI-off → the item is a plain task with title = raw text, fully usable.
**Downgraded from P0 to P1** — the app must ship and be dogfooded without it (Principle VIII).

### FR-2.3 Task decomposition — P0 · *DECIDE*
A **"Break it down"** action produces 3–7 concrete first-physical-action subtasks.
- Step 1 doable in under 5 minutes, requiring no decisions.
- Every step starts with a physical verb ("Open…", "Find…", "Type…"), never "Plan" or "Think about".
- Each step carries its own minute estimate.

**Non-AI path — P0.** A template library plus the user's own prior decompositions of similar tasks.
The AI path is an enhancement over this, never a replacement for it.

**Acceptance:** for "do my taxes", step 1 resembles "Open Files and search 'W2'" — not "Gather documents".

### FR-2.4 Place triggers — P0 · *SENSE* 🌟
A quest may carry a time trigger, a **place trigger**, or both.

Trigger kinds: **arrive** · **leave** · **pass near** (radius, user-set, default 250m) · **while out**
(fires when the user is away from all home-designated places for > 20 min).

- Places are user-named and stored as coordinates **on-device only** (Principle XII).
- Backed by OS-managed geofences. iOS caps monitored regions at 20 — the app maintains a
  **rolling active set** of the 20 highest-scoring regions and re-evaluates on significant location
  change.
- **Acceptance:** place triggers fire with the device in airplane mode.
- **Acceptance:** with location permission denied, every place-triggered quest degrades to a
  time-triggered or manual quest and the app remains fully functional.

### FR-2.5 Route chains — P1 · *DECIDE* 🌟
The user declares a destination ("heading to the gym"). The app returns an ordered chain of quests
that are *on the way*, sequenced by geography rather than priority, with a total added-time estimate.

- Chain is offered as one card ("4 stops, +18 min"), accepted or declined whole, then walked one
  stop at a time.
- Declining a single stop re-sequences the remainder without re-asking.
- **Non-goal:** turn-by-turn navigation. The app hands off to Apple Maps.

### FR-2.6 Automatic buffers — P0 · *DECIDE*
Every quest carrying a place or a hard start time gets travel time plus a padding factor applied
**automatically**. The padding factor is derived from the user's own historical lateness (rolling
median, min 8 samples), never from an optimistic default, and never requires the user to add buffer
manually (Principle III).

### FR-2.7 The single cross-system scorer — P0 · *DECIDE* 🌟
One pure function ranks **every** candidate action from **all seven systems** into one ordering.
Per-system ranking merged afterwards is prohibited (Principle II).

```
score = w1·urgency
      + w2·energy_match          // required energy vs current state (Regulation)
      + w3·time_fit              // estimate vs minutes until next commitment
      + w4·place_fit             // proximity / on-route (Quests)
      + w5·drift_pressure        // days overdue per tier (Bonds)
      + w6·momentum_bonus        // sibling completed in last 30 min
      + w7·rhythm_due            // habit/med/sleep window (Rhythms)
      − w8·staleness_penalty
      − w9·avoidance_penalty     // deferred 5+ times → demoted, offered for breakdown instead
      − w10·load_damping         // allostatic load (Regulation) — see FR-4.5
```

- `load_damping` is a **multiplier on effort**, not a flat penalty: as load rises, high-effort
  candidates fall and Regulation/Solitude candidates rise. At maximum load the scorer will offer a
  break, and nothing else outranks it.
- Weights are constants in v1, exposed under Settings → Advanced in v1.1.
- Lives in `src/domain/`, pure TypeScript, no React, no I/O, developed test-first (Principle IX).

**Acceptance:** a table-driven test suite covering ≥40 scenario fixtures, including: high load
suppresses all high-effort quests; a 90-day-overdue `bff` outranks a low-urgency work task; a
place-matched errand outranks a higher-urgency non-local task while the user is out.

### FR-2.8 Projects, tags & contexts — P1
Projects: flat list, optional, max one per quest, colour + emoji. Tags: many-to-many, free-form.
Contexts are tags with `kind='context'` (`@home`, `@computer`, `@errand`, `@phone`).

### FR-2.9 The Backlog (deliberately buried) — P0
Full list behind a dedicated tab, never on home. Views: by project, by energy, by quick-wins
(<10 min), by stuck (deferred 3+ times). **Sorting never defaults to oldest-first.**

### FR-2.10 Side-quest framing — P1 · *OFFER*
Quests may carry optional narrative framing — a title, a short line of flavour, a difficulty band.
Framing is **cosmetic only**: it never alters scoring, never gates completion, and is fully
disableable in one setting without loss of function.

### FR-2.11 Discovery quests — P2 · *OFFER*
App-suggested quests at places the user has never been, filtered by declared interests and travel
radius. Sources: user-authored templates and a curated bundled set. **No third-party place API in
v1** — it introduces a network dependency on a path that should stay offline-capable.

---

## 3. Rhythms

Habits, routines, schedule, sleep, medication.

### FR-3.1 Habits — P1 · *SENSE → SETTLE*
Recurring intentions with a target cadence (n× per period), **not** a daily binary.
- Cadence-based, so a miss is arithmetic, not a break.
- Streaks follow FR-0.7 and FR-0.7a in full.
- No decay, no HP, no penalty of any kind.

### FR-3.2 Routines as playlists — P1 · *DO*
Named ordered step lists (Morning, Leaving the House, Shutdown) with per-step timers. A run is a
**guided one-step-at-a-time screen**, not a checklist — the next step is the only thing on screen.
Partial completion is recorded without penalty. Steps are reorderable mid-run.

### FR-3.3 Visual timer — P0 · *DO*
A draining disc (radial sweep) as the primary representation; numeric readout secondary and smaller.
Runs full-screen in-app, as a Home Screen widget, and (v1.1) as a Live Activity.
**Timer state persists and restores from wall-clock time**, not in-process ticks, across process death.

### FR-3.4 Transition alarms — P0 · *OFFER*
Independent of tasks: a recurring "it is now X, you intended to be doing Y" ambient chime,
configurable per time block. The anti-time-blindness heartbeat.

### FR-3.5 Time-to-leave — P0 · *DECIDE → OFFER*
For calendar events with a location: `leave_at = event_start − travel − prep_buffer`, with prep
buffer learned per event type (default 15 min). Alerts at leave−15, leave−5, leave−0 with distinct
escalating sounds.

### FR-3.6 Day capacity — P1 · *SENSE*
A horizontal bar: committed calendar time + planned estimates vs waking hours. Over-commitment shows
as the bar exceeding the track, **stated as fact, not warning** ("Today's plan is 11h in a 9h day").
One tap defers the lowest-scoring items.

### FR-3.7 Sleep scheduler — P1 · *DECIDE → OFFER*
Works **backwards** from target wake time: computes and defends a wind-down window. During wind-down
the scorer suppresses all high-effort candidates and the notification cap drops to meds only.
No sleep tracking, no sleep scoring, no sleep quality claims.

### FR-3.8 Medication schedule & logging — P1 · *SENSE → MARK*
> ⚠️ **A log and a reminder. Never a dosing engine.**

- Per medication: name (free text — **no drug database ships**), dose as free text, times, days,
  optional "with food" note, start/end, active flag.
- One-tap `taken` / `skipped` / `taken late` with timestamp, **actionable from the notification
  without opening the app**. Retroactive edit allowed for 48h.
- Reminders may repeat until acknowledged, bounded by 3 repeats at 10-minute intervals, then stop.
- **Never stakeable** (Principle X.4). **No interaction checking** — permanently out of scope.
- A missed dose is never counted, aggregated, or shown as an adherence failure on any home surface.

### FR-3.9 Calendar — P1 · *SENSE*
Read-only import via `expo-calendar`. Feeds `time_fit`, day capacity, and time-to-leave.
Calendar **writing** is out of v1 scope.

---

## 4. Regulation

The nervous-system layer. Second-largest differentiator after place.

### FR-4.1 Dopamine menu — P0 · *DO* 🌟
A user-authored activity list in the established community structure: **starters** (quick, low
energy) · **mains** (medium effort) · **sides** (complementary) · **desserts** (easy to overdo) ·
**specials** (occasional, needs planning).

- Seeded with a bundled starter set at onboarding; every item editable and deletable.
- Each item carries: effort, typical duration, where it can be done, and whether it needs anything.
- Desserts are explicitly labelled as such by the user, not judged by the app.

**Acceptance:** the menu is usable and complete with zero network access and AI disabled.

### FR-4.2 Substitution, not prohibition — P1 · *OFFER*
When the user reaches for a dessert, the app offers the nearest **main** that scratches the same
itch — **once** — then gets out of the way and logs neither the offer nor the refusal.

**Prohibited:** blocking, app-limits, shaming copy, repeat prompts, and any record of the decline.

### FR-4.3 Overstimulation protocol — P0 · *SENSE → DO*
A one-tap declared state, reachable from every screen.
On entry: interface collapses to one action (FR-0.3), all non-critical notifications suppress,
active stakes suspend (FR-8.6), and the scorer offers only Regulation and Solitude candidates.
Exit is manual, or automatic after a user-set duration (default 90 min).

### FR-4.4 Resetters — P0 · *DO*
Short, concrete, physical interventions: cold water, walk the block, box breathing, floor for four
minutes, purposeful stimming, grounding. Selected by current state and by **where the user
physically is** — a resetter that requires a shower is not offered on a train.
All bundled, all offline, each under 5 minutes.

### FR-4.5 Allostatic load — P0 · *SENSE* 🌟
A slow-moving computed reading (0–100) assembled from: sleep debt, consecutive missed breaks,
overstim declarations in the trailing 7 days, social depletion (high-intensity Bonds activity),
and quest completion velocity relative to personal baseline.

- **Computed, never stored** (Principle IX).
- Feeds `load_damping` in the scorer (FR-2.7).
- Crossing the high threshold auto-suspends all live stakes (FR-8.6).
- **Never displayed as a score, grade, or number on the home surface.** It may be shown in Record as
  a trend line without a numeric axis.

**Rationale:** this is the design's primary safety valve. It is the mechanism by which the app stops
asking for hard things before the user has to notice they can't do them.

### FR-4.6 Enforced breaks — P1 · *OFFER*
Per Principle XIII — **friction, never lockout**.
After a focus session or a long unbroken work stretch: the break is pre-selected and one tap away.
Declining costs a deliberate ~15-second interaction that is **not** a watched countdown, carries no
dissuading copy, and is **never** counted, logged as a failure, or surfaced later.
The scorer may keep ranking the break highly. It must never refuse to offer anything else.

### FR-4.7 Meditation & guided audio — P1 · *DO*
Bundled short sessions (2/5/10 min) and wind-down audio. Offline, CC0-sourced, documented in
`ATTRIBUTIONS.md`. Framed as exercises. **Never** described as therapy, treatment, or hypnotherapy.

### FR-4.8 Focus sessions & distraction capture — P0 · *DO*
`select action → choose duration → start → (pause/resume) → end → log`. Durations 10/15/25/45/90 +
custom, defaulting to the action's estimate rounded up. Sessions may start with no action attached.
During a session a single always-visible field sends any intruding thought to the inbox **without
ending the session**. Captures-per-session is logged as a genuine attention metric.

### FR-4.9 Body doubling — P1 (solo) / P3 (multiplayer) · *DO*
- **v1 (P1):** scheduled sessions — pick a time, get a notification, join a screen showing an
  anonymous live count ("7 people focusing right now"). Presence only: no identity, no chat, no
  video. Broadcasts an opaque ephemeral id and nothing else.
- **P3:** named rooms, declared session goals, the Focusmate-shaped commit-and-check-in structure.

**Rationale for the priority:** body doubling is the most consistently effective ADHD intervention
in the literature and community reporting, but the multiplayer form needs other humans, which is
gated behind daily-driver status.

---

## 5. Bonds

A personal CRM for not losing people. Not for networking.

### FR-5.1 Tiers & cadence — P1 · *SENSE*
User-defined tiers, seeded with these defaults:

| Tier | Default cadence |
|---|---|
| Myself | daily |
| Relationship | daily |
| Family | weekly |
| BFF | weekly |
| Close friends | biweekly |
| Rizz | every 3 days while active |
| Hangout | monthly |
| Coworker | as-needed |
| Bizz | quarterly |

`Myself` is a real tier with real cadence and is the bridge into Solitude (§6). Cadence is
per-person-overridable; the tier only supplies the default.

### FR-5.2 Person record — P1 · *SENSE → MARK*
Per person: name, tier, cadence override, last contact, **last topic** (so the user can open with
it), notes, optional linked place, birthday.

**Privacy — P0 constraint:** contact records are third-party personal data. They stay on-device and
in the user's own rows, are never uploaded to any third party, are never sent to any SDK, and are
never used to construct a cross-user social graph (constitution, Security §).

### FR-5.3 Drift pressure — P1 · *DECIDE*
`drift = days_since_contact / cadence_days`, per person. Feeds `w5·drift_pressure` in the scorer so a
reach-out competes for the one card on equal footing with a work task.

**Never displayed as:** a neglect score, a red badge, a ranked list of people you're failing, or a
count of overdue relationships.

### FR-5.4 Hangouts tracked separately — P1 · *MARK*
In-person time is a distinct interaction kind from a message. A text does not satisfy a hangout
cadence. Logged in one tap, retroactively editable.

### FR-5.5 Place-aware reach-outs — P2 · *DECIDE* 🌟
When a person carries a linked place and the user is near it, `place_fit` boosts that person's
reach-out candidate: *"you're near their neighbourhood and it's been three months."*
Computed entirely on-device. The other person is never notified and never learns their location was
used (Principle XII).

### FR-5.6 Social depletion — P2 · *SENSE*
High-intensity Bonds activity feeds allostatic load, so a heavy social week lowers what the app asks
of the user afterwards. Introversion is modelled as a cost, not a defect.

---

## 6. Solitude

A quest category with its own curriculum. Learning to be alone without it registering as failure.

### FR-6.1 Solo quests — P1 · *OFFER → DO*
A curated bundled set with escalating exposure: coffee alone → meal alone → cinema alone → day trip
alone. Progression is user-paced and never gated on a schedule.
Framed as **skill acquisition**, never as consolation for having no plans.

### FR-6.2 Self-maintenance — P1 · *DO*
Hygiene, room, laundry, admin — the things that collapse first and silently. Modelled as Rhythms
with Solitude framing, so they benefit from cadence rather than daily-binary tracking.
**Never stakeable** and never counted as failures.

### FR-6.3 Dates with yourself — P1 · *DECIDE*
The `Myself` tier (FR-5.1) generates scheduled solo time on the same drift mechanism as every other
relationship. Being overdue with yourself is treated exactly like being overdue with a friend.

### FR-6.4 Curriculum content — P2 · *OFFER*
CBT-derived exercises for task initiation, catastrophising, and rejection sensitivity; shadow-work
journaling prompts; emotional-granularity practice.

**Delivery rule — P0 constraint:** content arrives **because the moment called for it**, attached to
an observed pattern. There is no browsable course library. A courses tab is a graveyard.
**Framing:** exercises, never therapy or treatment. No personalisation as clinical advice.

### FR-6.5 Crisis signposting — P0
Any detected crisis signal routes to **static, human-authored** signposting with local resources.
**AI never generates a response on this path** (Principle VIII). The companion does not handle it and
does not comment on it.

---

## 7. Record

Second brain and the evidence layer for everything else.

### FR-7.1 Journal — P1 · *MARK*
Free text, voice, and photo entries. Auto-linked to whatever action was live when written.
Entries are never required, never prompted more than once a day, never scored.

### FR-7.2 Two-tap check-in — P0 · *SENSE*
**Energy · mood · focus**, each 1–5, plus optional one-line note. Target interaction cost: **two
taps** for the common case, via a pre-selected default derived from time of day and recent history.
Prompted at most 3×/day at user-chosen times, always dismissible without consequence.
Feeds `energy_match` and allostatic load.

### FR-7.3 Progress documentation — P1 · *MARK* 🌟
Periodic self-recorded video or voice logs, retained and resurfaced. The app prompts for one at a
user-set cadence (default monthly) and, on the anniversary, plays back the previous one before
recording the next.

**Rationale:** externalising change over months is a genuinely powerful intervention precisely
because the user cannot feel that change from inside it.

### FR-7.4 Retrospectives — P1 · *SETTLE*
Auto-assembled weekly and monthly summaries, narrated by the companion.
**Positive framing only.** Reports what happened and what patterns appeared. Never reports what
didn't happen, never computes a completion rate, never compares periods unfavourably.

### FR-7.5 Correlation views — P2 · *SENSE*
Read-only charts over 7/30/90 days: focus minutes vs med-taken days, mood/energy by time of day,
completion by energy level, estimate accuracy trend, load trend.
Every chart carries a persistent, non-dismissible disclaimer: *"This is a personal log, not medical
evidence. Correlation is not causation. Discuss changes with your prescriber."*
No p-values. No insight phrased as a recommendation.

### FR-7.6 Prescriber export — P2 · *MARK*
Clean PDF/CSV for a date range: med adherence, check-in averages, focus minutes. Framed explicitly
as "notes to bring to your appointment".

---

## 8. Stakes

> ⚠️ **Every requirement in this section is gated by Principle X. All ten conditions are
> conjunctive — failing any one makes the feature a prohibited punishment mechanic.**
> Nothing in this section may ship before FR-4.5 (allostatic load) is implemented and tested,
> because guardrail 8 depends on it.

### FR-8.1 Soft currency — P1 · *SETTLE*
Per FR-0.7. No cash value, not purchasable, not convertible in either direction. This is the
gamification economy and it is **entirely separate** from §8.2 onward.

### FR-8.2 Commitment contracts — P2 · *SETTLE*
A user-authored stake attached to a single quest.

Enforced at creation:
- Opt-in per commitment. Off by default. **The app never suggests, recommends, or upsells a stake.**
- Not attachable to a commitment due within **2 hours**.
- Not attachable while overstimulation is declared or load is above the high threshold.
- Not attachable to any Rhythms or Regulation action (FR-3.8, FR-4.x, FR-6.2) — **health behaviours
  are never stakeable.**

### FR-8.3 Asymmetric cap — P2
A user-set ceiling on total money at risk per calendar month.
**Lowering takes effect immediately. Raising takes effect after 7 days.**
Rationale: impulsive escalation is a specific, foreseeable ADHD risk, and the asymmetry costs the
honest user nothing.

### FR-8.4 Verification proposes, a human confirms — P2 · *MARK* 🌟
**No sensor signal — GPS, geofence, motion, screen time — may resolve a stake unilaterally.**
Automated evidence may only raise a prompt. A user assertion of completion is accepted without proof
and closes the matter.

**Rationale:** GPS drift, dead batteries, and indoor false-negatives are routine. A single wrongful
charge destroys trust in the companion permanently and generalises to everything else it says. A
false pass costs nothing.

### FR-8.5 Endorsed destination — P2
Forfeited funds go to a destination the user selected and endorses.
**Prohibited:** anti-charities, any destination chosen to maximise pain, and any accrual to the
developer, the app, or any party with an interest in the user failing.

### FR-8.6 Safety valves — P2 🌟
- **One free unwind per calendar month** — dissolve any live stake, no forfeit, no reason required,
  no friction beyond confirmation.
- **Automatic suspension under load** — when allostatic load crosses the high threshold, all live
  stakes auto-suspend with no user action, and do not resume until load has cleared for a full day.
  Reported neutrally; **never** framed as the user having given up.
- **Auto-suspension on re-entry** — 72h absence suspends everything live (FR-0.8).

### FR-8.7 The ledger — P2
A separate, deliberately plain surface the user navigates to. **Uses none of the companion's voice,
face, colour, or animation vocabulary** (Principle XI).
Shows individual transactions only. **No cumulative loss figure, monthly total, failure rate, or
comparative statistic exists anywhere in the product** (Principle X.9).

### FR-8.8 Money handling — P2
Real-money movement executes through a **licensed third-party processor**, directly from user to
endorsed destination. **The app holds, pools, escrows, and redistributes nothing.**

### FR-8.9 Moai — P3 · *SETTLE*
A fixed small group (5–10, per the Okinawan original) who see each other's declared commitments and
outcomes. **Witness, not penalty. Carries no money.**
This is the sanctioned path to group accountability and is preferred over §8.2 wherever it achieves
the effect.

### FR-8.10 Community pot, competitions, giveaways — P3 🚫
**Out of scope until a legal entity and a licensing review exist.** Pooling and redistributing user
funds is money transmission; performance-decided giveaways implicate sweepstakes law.
**MUST NOT be designed into the v1 data model.**

### FR-8.11 Crypto / token / DAO — ❌ **Rejected**
Guideline 3.1.5 requires organization enrolment and per-region licensing; the developer is enrolled
as an individual. No wallet, no token, no DAO, in any phase, absent a documented reversal.

---

## 9. Surfaces

### FR-9.1 Now — P0
The companion and one card. The default screen and ~90% of daily use.

### FR-9.2 The Map — P1 🌟
Quest pins, named places, route chains, "while you're out" bundles. Pins are **intentions, not
achievements**.
- Renders from on-device data. No tile provider receives a user's coordinates.
- Session-scoped movement tracking only, user-started and user-ended and visible throughout.
  **No continuous background positioning** (Principle XII).

### FR-9.3 Record surface — P0
Journal, voice logs, retrospectives, correlations, and the ledger entry point.

### FR-9.4 Experience discovery — P3 · *OFFER*
The "Bump for new experiences" idea: a map of things the user has never tried, filtered to things
they'd plausibly do.

### FR-9.5 Activity & place matching — P3 🚫
Matching people by shared activities and frequented places.
**Non-negotiable if ever built:** place-level not point-level, never real-time, no location history
exposed, opt-in per place, mutual consent before any reveal, **block and report shipping in the same
release, not a follow-up** (Principle XII).

---

## 10. Non-functional requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-1 | Cold launch to interactive | < 1.5s on the reference device (iPad Air 4th gen, A14, 4 GB) |
| NFR-2 | Capture write latency (local) | < 50ms, no network in path |
| NFR-2a | **Layout across iPad size classes** | Renders correctly at 1180×820pt, 820×1180pt, Split View halves and thirds, and Slide Over ~320pt. All four orientations |
| NFR-2b | **Hardware keyboard** | Capture is fully operable from a Magic/Smart Keyboard: field focused on launch, Return commits, Escape clears |
| NFR-3 | Full offline operation | Every P0 feature works in airplane mode, indefinitely |
| NFR-4 | Sync convergence | < 5s after reconnect for < 500 pending ops |
| NFR-5 | Conflict resolution | LWW per row; `deleted_at` tombstones; **captures never merged, never lost** |
| NFR-6 | Accessibility | WCAG 2.2 AA, full VoiceOver, Dynamic Type to XXL without clipping, targets ≥48pt |
| NFR-7 | Battery — background | ≤ 1%/day sync + geofences. **No continuous background positioning** |
| NFR-8 | Battery — active session | ≤ 8%/hour with map and movement session live |
| NFR-9 | Geofence limit | Rolling active set ≤ 20 monitored regions; re-evaluated on significant location change |
| NFR-10 | Crash-free sessions | > 99.5% |
| NFR-11 | Privacy — SDKs | No third-party SDK ever receives task titles, capture text, med names, check-in values, notes, **contact names, place names, or coordinates**. Enforced by automated test |
| NFR-12 | Privacy — location | Precise coordinates never leave the device. Nothing synced above place-level granularity |
| NFR-13 | Privacy — iCloud | No PHI written to iCloud; local SQLite excluded from backup |
| NFR-14 | AI cost ceiling | < $0.02/user/day; hard per-user daily cap enforced server-side |
| NFR-15 | Data retention | Account deletion purges all rows within 30 days; export available before deletion |
| NFR-16 | Scorer performance | Full re-rank over 2,000 candidates in < 16ms (one frame) |
| NFR-17 | Domain test coverage | `src/domain/` at 100% branch coverage. It is pure and cheap to test; there is no excuse |
| NFR-18 | Copy safety | CI fails on any string matching the banned-pattern catalogue (FR-1.2) |
| NFR-19 | RLS | Default-deny on every user-owned table; CI test asserts user B sees zero rows of user A across every table |

---

## 11. Explicit non-goals for v1

- Team/family sharing
- Web app (the marketing site is not the app)
- Android
- AI chat interface / "talk to your tasks"
- Calendar **writing** (read-only in v1)
- Turn-by-turn navigation (hand off to Apple Maps)
- Sleep tracking or sleep scoring (scheduling only)
- Third-party place/POI API dependency
- Drug interaction checking — **permanently out of scope**
- Anything that diagnoses ADHD, or claims to treat, measure, or regulate dopamine
- Any cryptocurrency, token, wallet, or DAO — **rejected, not deferred**
- Pooling or redistributing user money — blocked on a legal entity

---

## 12. Traceability

| Constitution principle | Enforced by |
|---|---|
| I — Capture Is Sacred 🔒 | FR-2.1, NFR-2, NFR-5 |
| II — One Next Action | FR-1.3, FR-2.7, FR-2.9 |
| III — Time Is Visual | FR-3.3, FR-2.6, FR-3.6 |
| IV — No Punishment Mechanics 🔒 | FR-0.7, FR-0.7a, FR-0.8, FR-1.1, FR-1.2, FR-3.1, FR-7.4 |
| V — App Decides, User Vetoes | FR-0.1, FR-1.3, FR-2.6, FR-7.2 |
| VI — Offline-First 🔒 | FR-2.4, FR-4.1, NFR-3, NFR-4 |
| VII — Low-Stim By Default | FR-0.2, FR-0.3, FR-4.3, NFR-6 |
| VIII — AI Is Optional 🔒 | FR-2.2, FR-2.3, FR-6.5, NFR-14 |
| IX — Pure Domain Logic Test-First | FR-2.7, FR-4.5, NFR-16, NFR-17 |
| X — Stakes Are Contracts 🔒 | FR-8.2 – FR-8.8 |
| XI — Companion Not A Creditor 🔒 | FR-1.1, FR-1.2, FR-8.7, NFR-18 |
| XII — Location Sensitive By Default 🔒 | FR-2.4, FR-5.5, FR-9.2, FR-9.5, NFR-12 |
| XIII — Friction, Never Lockout | FR-4.2, FR-4.6 |

**Sequencing** — see `VISION.md` §11. Phase gates are hard: no phase N+1 until phase N has had a
full week of real daily use. No system requiring other humans (FR-4.9 multiplayer, FR-8.9, FR-9.4,
FR-9.5) begins before the solo app is the owner's daily driver.
