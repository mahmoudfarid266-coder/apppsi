<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 2.0.0
Bump rationale: MAJOR. Principle IV (NON-NEGOTIABLE) is redefined — it previously
                banned all failure consequences without exception; it now carries an
                explicit, tightly-bounded carve-out for user-authored commitment
                contracts. That is backward-incompatible with any plan written against
                v1.0.0. Principle II is materially expanded (cross-system scoring).
                Four principles added. Product scope expanded from four pillars to
                seven systems under one companion.

Principles amended:
  II.   One Next Action — extended: the one action may originate in ANY system, and
        all systems MUST compete in a single scorer.
  IV.   No Punishment Mechanics — carve-out added; delegates stakes to Principle X.

Principles added:
  X.    Stakes Are Contracts, Not Punishments (NON-NEGOTIABLE)
  XI.   The Companion Is Not A Creditor (NON-NEGOTIABLE)
  XII.  Location Is Sensitive By Default (NON-NEGOTIABLE)
  XIII. Enforcement Is Friction, Never Lockout

Sections amended:
  - Security, Privacy & Regulatory Constraints — expanded to cover the curriculum
    (CBT/hypnosis/EQ), location data, contact data, and money-movement regulation.
  - Development Workflow & Quality Gates — phase-gate rule restated for seven systems.

Owner decisions recorded (2026-07-29):
  D1 stakes model       → hybrid: contract model with the ten guardrails of Principle X
  D2 enforcement        → friction, not lockout (Principle XIII)
  D3 solo-before-social → retained; social systems gated behind daily-driver status
  D4 repo               → Rudder assets carried forward into the active working tree

Templates requiring updates:
  ⚠ .specify/templates/plan-template.md — Constitution Check table MUST gain rows for
    Principles X, XI, XII, XIII. REQUIRED before the next /speckit-plan run.
  ✅ .specify/memory/constitution.md     — this file
  ⚠ .specify/templates/spec-template.md  — reviewed; domain-agnostic, no change needed
  ⚠ .specify/templates/tasks-template.md — reviewed; no constitution-driven change

Source of truth for principles: VISION.md, then docs/00-overview.md §3 and
docs/01-prd.md §5 once those are rewritten from VISION.md. Both are currently STALE
against this document — see Governance.

Deferred TODOs:
  - docs/00-overview.md and docs/01-prd.md rewrite (tracked, not blocking ratification)
  - specs/001-capture-sync/ is stale and superseded; delete before the next specify run
-->

# Rudder Constitution

*Rudder is a working title. See VISION.md §9 D5.*

Rudder is an ADHD executive-function companion. Its user has a documented, mechanical
difficulty with initiation, working memory, time perception, dopamine regulation, and
sustaining connection. Every principle below exists because violating it makes the app
actively harmful to that user — not merely less pleasant. These are gates, not aspirations.

The product is **one loop** — SENSE → DECIDE → OFFER → DO → MARK → SETTLE — fed by **seven
systems** (Quests, Rhythms, Regulation, Bonds, Solitude, Record, Stakes) and rendered
through **one companion**. A proposed feature that does not occupy a stage of that loop
does not belong in the product.

## Core Principles

### I. Capture Is Sacred (NON-NEGOTIABLE)

A thought that is not captured within roughly two seconds is lost. Therefore:

- Capture MUST require zero decisions: no required fields, no list picker, no date picker.
- Time from cold launch to first typed character MUST be under 2.0s on an iPad Air M1.
- Local write latency MUST be under 50ms, with no network call on the write path.
- A capture MUST NEVER be lost to a sync conflict. Captures are append-only and are never
  merged; last-writer-wins applies to every other entity but not to this one.
- Triage is the app's job, performed later and asynchronously. It is never a precondition
  of capture succeeding.

**Rationale:** this is the single feature whose failure invalidates the entire product.
Everything else can degrade; this cannot.

### II. One Next Action

- The home screen MUST show exactly one action.
- That action MAY originate in any of the seven systems. A reach-out to a drifting person,
  a break, a solo quest, and a work task MUST be eligible to win the same slot.
- All candidate actions from all systems MUST be ranked by a **single scorer**. Per-system
  ranking that is merged afterwards is prohibited — it reintroduces the choice the scorer
  exists to remove.
- The offer MUST carry exactly three affordances: do it, not now, something else. Never a list.
- The full backlog MUST NOT be surfaced by default. It lives behind a dedicated tab.
- Backlog sorting MUST NEVER default to oldest-first — that is a shame list.
- Inbox state MUST be presented as a count, never as an inline list, and never as a badge
  that reads as an alert.
- Empty states MUST be phrased as sufficiency ("Nothing needs you right now"), never as
  absence ("0 tasks").

**Rationale:** decision fatigue is a primary failure mode. Showing forty items is how a
user ends up on TikTok. The single cross-system scorer is also the product's only real
moat: competitors own one system each and none of them can weigh a text to your brother
against the dishes.

### III. Time Is Visual

- Durations MUST be represented visually first — a draining disc, a depleting bar.
- Numeric readouts are permitted only as secondary, visually subordinate information.
- Time remaining until the next commitment MUST be expressible without the user performing
  arithmetic.
- Timer state MUST survive process death and be restored from wall-clock time, not from
  elapsed in-process ticks.
- Every quest carrying a place MUST have travel time and a padding factor applied
  automatically, derived from the user's own historical lateness — never from an optimistic
  estimate and never requiring the user to add buffer manually.

**Rationale:** digital clocks and numeric durations do not register as time pressure for a
time-blind user. The representation is the feature.

### IV. No Punishment Mechanics (NON-NEGOTIABLE)

- The UI MUST contain no red, with a single exception: destructive-action confirmation
  dialogs. Overdue state is amber at its most severe.
- Streaks MUST be recoverable. A gap is rendered as "paused", never "lost", and one
  completed task within 72 hours restores it.
- Missed days, skipped doses, abandoned sessions, and **resolved stakes** MUST be rendered
  in neutral tones and MUST NOT be aggregated into any visible failure count, running total,
  or cumulative loss figure.
- A re-entry flow MUST exist and MUST activate after 72 hours of absence: overdue state is
  suppressed, no counts are shown, and a single small task is offered.
- The companion MUST NOT degrade, sicken, wilt, or display neglect in response to user
  absence or failure. Companion growth is a function of cumulative contribution only.

**Carve-out.** A user-authored commitment contract is not a punishment mechanic, provided
every condition of Principle X holds. Absent any one of them, it is, and it is prohibited.

**Rationale:** shame drives abandonment, and an abandoned app helps nobody. Recovery after
a lapse is a designed path, not an edge case. The pet that looks sad when you disappear is
a punishment mechanic wearing a cute hat, and it is the specific reason people quit
companion apps in shame rather than in boredom.

### V. The App Decides, The User Vetoes

- Every screen MUST be completable by accepting defaults alone.
- Every inferred field MUST be pre-filled and single-tap correctable.
- The app MUST NEVER ask the user to recall information it could infer, store, or guess.
- Where the app selects on the user's behalf, an override MUST be available but MUST NOT
  be the primary affordance.

**Rationale:** externalising working memory is the product. Asking the user to remember
something is the app failing at its job and charging them for it.

### VI. Offline-First (NON-NEGOTIABLE)

- Every P0 feature MUST function fully with airplane mode enabled, indefinitely.
- Local SQLite is the source of truth for the UI. The server is the source of truth for the
  account. No UI read path may block on the network.
- All writes go to SQLite plus a local outbox and return immediately.
- Timer, reminder, and geofence notifications MUST be scheduled locally. Push is permitted
  only for digests and non-time-critical nudges.
- Sync MUST converge within 5s of reconnect for fewer than 500 pending operations.
- Counters (focus minutes, soft currency, XP) MUST be stored as append-only event rows and
  summed, never as mutable integers.
- Any system that cannot function offline — community, matching, real-money settlement —
  MUST NOT be a P0 feature and MUST NOT block any P0 path.

**Rationale:** a loading spinner between the user and their thought is a lost thought.

### VII. Low-Stim By Default

- OS `Reduce Motion`, `Reduce Transparency`, `Increase Contrast`, and Dynamic Type MUST be
  honoured on every screen, with no exceptions granted for "hero" surfaces or for the
  companion.
- Low-stim mode MUST reduce all animation to 0ms, remove gradients, parallax, and celebratory
  effects, and collapse to a single accent colour.
- Contrast MUST meet WCAG 2.2 AA (4.5:1 body, 3:1 large text).
- Touch targets MUST be at least 48×48pt.
- Dynamic Type MUST render to XXL without clipping or truncation.
- Every interactive element MUST carry a VoiceOver label.
- A declared overstimulation state MUST collapse the interface to a single action and
  suppress all non-critical notification delivery until the user exits it.

**Rationale:** sensory sensitivity is comorbid with ADHD at high rates. An accessibility
mode retrofitted late is an accessibility mode that is broken on half the screens.

### VIII. AI Is Optional (NON-NEGOTIABLE)

- The app MUST remain fully usable with AI disabled via a settings toggle, and that path
  MUST be verified end-to-end before each release.
- AI failure, timeout, offline state, or exceeding the per-user daily spend cap MUST degrade
  gracefully to the manual path. None of these may surface as an error state.
- An untriaged capture MUST remain a valid, usable task with its raw text as the title.
- Task decomposition MUST have a non-AI path (templates plus the user's own prior splits).
- AI MUST NOT be on the critical path of any P0 feature, and MUST NEVER be on the path of
  any stake resolution or any crisis-signposting path.

**Rationale:** the product's value is mechanical, not generative. AI improves triage and
decomposition; it does not constitute the app.

### IX. Pure Domain Logic Is Test-First

- The cross-system scorer, allostatic load calculation, calibration factor, streak-repair
  rules, day-capacity calculation, drift scoring, and adherence computation MUST live in
  `src/domain/` as pure TypeScript with no React imports and no I/O.
- That module MUST be developed test-first (RED-GREEN-REFACTOR) and MUST NOT require a
  simulator to test.
- Derived values (adherence %, calibration factor, streaks, focus totals, capacity, drift,
  load) MUST be computed, never stored. Storing them creates sync conflicts for no benefit.

**Rationale:** this is where the product's behaviour actually lives. It is also the only
part that is cheap to test exhaustively, so it must be the part that is tested exhaustively.

### X. Stakes Are Contracts, Not Punishments (NON-NEGOTIABLE)

A stake is a commitment the user authored in advance for themselves. It is never a
consequence the app imposes. All ten conditions are conjunctive — **failing any one makes
the feature a punishment mechanic and therefore prohibited under Principle IV.**

1. **Opt-in per commitment.** Stakes MUST be off by default, MUST be attached one at a time,
   and MUST NEVER be applied globally, to a category, or to a recurring item wholesale. The
   app MUST NEVER suggest, recommend, or upsell attaching a stake.
2. **Authored in advance, while regulated.** A stake MUST NOT be attachable to a commitment
   falling due within 2 hours, and MUST NOT be attachable while the user is in a declared
   overstimulation state or above the high-load threshold.
3. **Asymmetric cap.** The user sets a hard ceiling on total money at risk per calendar
   month. Lowering it takes effect immediately; raising it takes effect after 7 days.
4. **Never on health behaviours.** Medication, sleep, meditation, breaks, mood check-ins,
   and any Regulation-system action MUST NEVER be stakeable. These are the behaviours that
   fail *because* the user is unwell; staking them fines illness.
5. **Verification proposes, a human confirms.** No sensor signal — GPS, geofence, motion,
   screen time — MAY resolve a stake unilaterally. Automated evidence MAY only raise a
   prompt. A user assertion of completion MUST be accepted without proof.
6. **Endorsed destination.** Forfeited funds MUST go somewhere the user selected and
   endorses. Anti-charities (destinations chosen to maximise pain) are prohibited. Funds
   MUST NEVER accrue to the developer, the app, or any party with an interest in the user
   failing.
7. **One free unwind per month.** The user MUST be able to dissolve any live stake without
   forfeit, once per calendar month, with no reason required and no friction beyond
   confirmation.
8. **Automatic suspension under load.** When computed allostatic load crosses the high
   threshold, all live stakes MUST auto-suspend without user action, and MUST NOT resume
   until load has cleared for a full day. Suspension MUST be reported neutrally and MUST
   NEVER be framed as the user having given up.
9. **No residue.** After resolution, no cumulative loss figure, monthly total, failure rate,
   or comparative statistic MAY be displayed anywhere. The ledger shows individual
   transactions and nothing aggregated.
10. **Walled off from the companion.** Per Principle XI.

**Soft currency is separate and unconvertible.** In-app currency earned by completing
actions MUST have no cash value, MUST NOT be purchasable, and MUST NOT be convertible to or
from real money in either direction. It exists for cosmetics, unlocks, and rerolls only.

**Rationale:** commitment devices have real evidence behind them, and the owner asked for
one deliberately. The difference between a commitment device and a punishment is agency and
timing — who decided, and when. These ten conditions are what keep it on the right side of
that line. Conditions 4 and 8 matter most: without them the mechanic strikes hardest exactly
when the user is least able to bear it, which is the failure mode every existing forfeit app
ships with.

### XI. The Companion Is Not A Creditor (NON-NEGOTIABLE)

The companion is the product's primary interface and its emotional contract with the user.

- The companion MUST NEVER reference money, stakes, forfeits, amounts, or settlement — not
  to warn, not to remind, not to congratulate the user for avoiding a charge.
- Stakes MUST live on a separate, deliberately plain ledger surface the user has to navigate
  to. That surface MUST NOT use the companion's voice, face, or animation vocabulary.
- The companion MUST NEVER shame, guilt, express disappointment, or reference a lapse as a
  loss.
- The companion MAY observe **patterns** ("third Tuesday in a row") but MUST NOT narrate
  **incidents** as failures ("you didn't do it today").
- Companion state MUST NOT be a function of current streak, recent compliance, or absence.
- The companion MUST NOT manufacture urgency or enthusiasm it does not have grounds for.

**Rationale:** a warm animal that takes your money is a betrayal object, and the betrayal
generalises — the user stops trusting the companion about everything else. If the two cannot
be kept apart, stakes do not ship.

### XII. Location Is Sensitive By Default (NON-NEGOTIABLE)

- Precise location MUST NEVER leave the device. Anything synced or shared is reduced to a
  named place or a coarse area.
- Real-time position MUST NEVER be exposed to another user, in any feature, under any
  setting.
- Location history MUST NEVER be exposed to another user, aggregated or otherwise.
- Any social location feature MUST be opt-in per place, MUST require mutual consent before
  any reveal, and MUST ship with block and report on day one — not in a follow-up release.
- Continuous background positioning is prohibited. Passive awareness uses OS-managed
  geofences and significant-location-change only. Continuous tracking is permitted solely
  inside an explicitly started, user-visible, user-endable session.
- Location MUST NOT be a required permission. Every location feature degrades to its
  time-based equivalent when permission is denied.

**Rationale:** location plus social is a stalking vector, and the user of this app is
disclosing a mental-health-adjacent dataset alongside it. Battery is the secondary reason;
safety is the first.

### XIII. Enforcement Is Friction, Never Lockout

Where the app "enforces" a break, a meditation, or a wind-down:

- The app MUST NOT block, disable, or lock out any other function.
- The intended action MUST be the path of least resistance — pre-selected, one tap, already
  loaded.
- Declining MUST remain possible, and MUST cost a deliberate interaction of roughly 15
  seconds. That friction MUST NOT be a countdown the user watches, and MUST NEVER be
  accompanied by dissuading copy, guilt, or a confirmation that questions their judgement.
- Declining MUST NOT be recorded as a failure, counted, or surfaced later.
- The scorer MAY continue to rank the deferred action highly. It MUST NOT refuse to offer
  anything else.

**Rationale:** external structure genuinely compensates for weak internal executive
function, so "make me" is the correct instinct. But a hard lock is a punishment mechanic in
a different costume, and it gets resented on exactly the bad day it was built for. Friction
gets respected; lockouts get uninstalled.

## Security, Privacy & Regulatory Constraints

**This is a log and a coach, not a medical device.** Hard boundary:

- The app MUST NOT diagnose, MUST NOT suggest, calculate, or adjust a dose, and MUST NOT
  make efficacy, treatment, or accuracy claims — in the product, the App Store listing, or
  marketing.
- Medication dose is free text entered by the user. No drug database MAY be shipped.
  Drug-interaction checking is permanently out of scope.
- Curriculum content (CBT-derived exercises, shadow work prompts, guided audio, emotional
  granularity practice) MUST be presented as exercises. It MUST NOT be described as therapy,
  treatment, hypnotherapy, or clinical intervention, and MUST NOT be personalised as
  clinical advice.
- The app MUST NOT claim to measure, regulate, manage, or optimise dopamine or any other
  neurotransmitter. "Dopamine menu" is permitted as the established community term for a
  user-authored activity list; any claim of physiological effect is not.
- Every analytics or correlation view MUST carry a persistent, non-dismissible disclaimer
  stating that it is a personal log, that correlation is not causation, and that changes
  should be discussed with a prescriber.
- Crisis content MUST NOT be handled by the companion. Any detected crisis signal routes to
  static, human-authored signposting. AI MUST NEVER generate a response in that path.

**Data protection:**

- Row Level Security MUST be enabled on every user-owned table, default-deny, with explicit
  `user_id = auth.uid()` policies. A CI test MUST assert that user B sees zero rows of user
  A's data across every table. RLS bugs are silent until they are a breach.
- The Anthropic API key and the Supabase `service_role` key MUST NEVER reach the client.
  All model calls go through an Edge Function.
- Personal health information MUST NEVER be written to iCloud. Local SQLite MUST be excluded
  from iCloud backup.
- No third-party SDK — analytics, crash reporting, or otherwise — MAY receive task titles,
  capture text, medication names, check-in values, note content, contact names, place names,
  or coordinates. Scrubbing MUST be enforced by an automated test, not by convention.
- Contact records in the Bonds system are third-party personal data. They MUST remain
  on-device and in the user's own rows, MUST NEVER be uploaded to any third party, and MUST
  NEVER be used to build a social graph across users.
- Health and fitness data MUST NEVER be used for advertising, marketing, or data mining.
  The app ships with zero advertising SDKs.
- Account deletion MUST be available in-app and MUST purge all rows within 30 days. Data
  export MUST work offline and MUST precede deletion.

**Money and regulation:**

- The app MUST NOT hold, pool, escrow, or redistribute user funds. Any real-money movement
  MUST be executed by a licensed third-party processor, directly from the user to an
  endorsed destination. Money transmission and e-money licensing are out of scope, which
  means the architecture must never require them.
- Community pooling, mutual funds, prize competitions, giveaways decided by performance, and
  any redistribution of user money between users are **out of scope until a legal entity and
  a licensing review exist**. They MUST NOT be designed into the v1 data model.
- No cryptocurrency, token, wallet, or DAO. Guideline 3.1.5 requires organization enrolment
  and per-region licensing; the developer is enrolled as an individual.
- Soft currency MUST have no cash value and MUST NOT be purchasable, which keeps it outside
  Guideline 3.1.1.
- Social accountability (a moai that witnesses commitments and outcomes) is the sanctioned
  path to group stakes. It carries no money and is preferred wherever it achieves the effect.

**Cost:**

- A hard per-user daily AI spend cap MUST be enforced server-side against a persisted ledger.
  Exceeding it degrades per Principle VIII.

## Development Workflow & Quality Gates

- Feature work follows the Spec Kit flow: `/speckit-specify` → `/speckit-clarify` →
  `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`. `/speckit-clarify` MUST NOT be
  skipped.
- Every `/speckit-plan` run MUST complete the Constitution Check gate before Phase 0 research
  and MUST re-check it after Phase 1 design.
- Roadmap phases are gates, not suggestions. Work MUST NOT begin on phase N+1 until the
  phase N build has been in real daily use for one week. **Scope creep across seven systems
  is the primary identified project risk**, and the seven-system scope makes this rule
  stricter than it was at four pillars, not looser.
- No system requiring other human users MAY begin before the solo app is the owner's daily
  driver.
- Completion claims MUST be backed by executed verification commands and their output. "It
  should work" is not a completion signal.
- Repository files MUST be normalized to LF. CRLF breaks builds on macOS CI runners.
- Secrets MUST NEVER be committed. They live in gitignored local env files, EAS Secrets for
  builds, and Supabase Function secrets for server runtime.

## Governance

This constitution supersedes all other development practice for this project. Where a
convenience, a library default, or an AI-generated suggestion conflicts with a principle
here, the principle wins.

**Amendment procedure.** Amendments MUST be proposed as a change to this file with a written
rationale. `VISION.md` is the current narrative source of these principles; `docs/00-overview.md`
§3 and `docs/01-prd.md` §5 are **stale against v2.0.0** and MUST be rewritten from `VISION.md`
before they are cited again. Any subsequent amendment to one MUST be mirrored in the others in
the same change. Principles marked NON-NEGOTIABLE MAY only be amended by explicit owner
decision recorded in the commit message.

**Versioning policy.** Semantic versioning applies to this document:

- **MAJOR** — a principle is removed or redefined in a backward-incompatible way.
- **MINOR** — a principle or section is added, or existing guidance is materially expanded.
- **PATCH** — clarification, wording, or typo fixes carrying no semantic change.

**Compliance review.** The Constitution Check gate in `plan-template.md` is the enforcement
point. Any violation carried into implementation MUST be recorded in that plan's Complexity
Tracking table with the justification and the rejected simpler alternative. An unjustified
violation blocks the plan.

**Version**: 2.0.0 | **Ratified**: 2026-07-27 | **Last Amended**: 2026-07-29
