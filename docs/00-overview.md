# Rudder — ADHD Executive Function Companion

> **Working title.** `Rudder` is a codename, chosen for a steering metaphor before the companion
> existed. A companion-led product may want a creature, not an instrument — see `VISION.md` §9 D5.
> Before submission, check availability in App Store Connect + USPTO.
> Alternatives held: *Tempo*, *Anchor*, *Throughline*.

**Codename:** `rudder`
**Owner:** solo developer (Windows 11 host machine)
**Target platforms:** iPadOS + iOS (v1), Android (v2, free with the stack choice)
**Version 2.0** · rewritten 2026-07-29 against constitution v2.0.0

> **An animal companion that knows where you are, what you've got left in the tank, and who you're
> drifting away from — and asks you for exactly one yes at a time.**

---

## 1. The problem

ADHD is not a motivation deficit. It is a mechanical impairment of the systems that convert intent
into action: time perception, working memory, task initiation, and reward signalling. The
interventions that reliably help are **external** — structure placed in the environment, at the point
of performance. That is what this app is.

Nine failure modes, all mechanical:

| # | Failure mode | What it looks like |
|---|---|---|
| 1 | Working-memory collapse | The thought existed. It's gone. It mattered |
| 2 | Task-initiation paralysis | You know exactly what to do and cannot begin |
| 3 | Time blindness | "Five minutes" was ninety. Late again |
| 4 | Decision fatigue | Twelve fine options, zero chosen, evening gone |
| 5 | Shame spiral → abandonment | Missed three days, can't open the app, delete it |
| 6 | Interoception gap | Didn't notice the crash coming |
| 7 | Dopamine mismanagement | Reached for the cheap hit, got the hangover, repeat |
| 8 | Connection drift | Four months since you texted someone who matters |
| 9 | Solitude intolerance | Alone reads as failing, so you never rest properly |

**Failure mode 5 is the one that kills products.** Roughly half of habit-app users are gone by day
60 and three-quarters by day 90. The named mechanisms are *streak anxiety* — the stress that grows
with streak length, because a longer streak makes a miss more expensive — and the *what-the-hell
effect*, where one miss converts into total abandonment. Most competitors ship precisely the
mechanics that cause this: HP loss, stat decay, breakable streaks, prominent failure counts. That is
why constitution Principle IV exists, why it is non-negotiable, and why FR-0.7a makes streaks *less*
visible as they grow.

## 2. What Rudder is

Not a to-do app with a mascot. **The companion is the decision engine, given a face.** The ADHD
problem is not "I don't know my tasks" — it's "I can't choose, start, or feel time passing." So the
product decides and asks for one yes.

**One loop:**

```
SENSE → DECIDE → OFFER → DO → MARK → SETTLE
```

**Seven systems** feed it, and every candidate they produce is ranked by **one scorer**. That single
architectural commitment is what separates this from everything on the market:

| System | Owns |
|---|---|
| **Quests** | Tasks, errands, side quests. Place is a first-class trigger |
| **Rhythms** | Habits, routines, schedule, sleep, medication |
| **Regulation** | Dopamine menu, overstimulation, resetters, allostatic load |
| **Bonds** | Personal CRM for not losing people |
| **Solitude** | Being alone as a skill, not a consolation prize |
| **Record** | Second brain, journal, progress documentation |
| **Stakes** | Soft currency, commitment contracts, the moai |

**Three surfaces:** Now (the companion and one card) · Map (quests bound to place) · Record.

**The moat:** every competitor owns one system. None of them share a scorer. Nobody else can weigh
*text your brother* against *do the dishes* against *take a nap*, using where you are and what's left
in your tank.

## 3. Non-negotiable design principles

Full text in `.specify/memory/constitution.md` **v2.0.0**. Thirteen principles, eight NON-NEGOTIABLE 🔒.

| | Principle |
|---|---|
| I | **Capture Is Sacred** 🔒 — <2s to typing, <50ms write, never lost to a conflict |
| II | One Next Action — one card, from one cross-system scorer, never a list |
| III | Time Is Visual — draining disc primary, automatic buffers, wall-clock restore |
| IV | **No Punishment Mechanics** 🔒 — no red, streaks pause, no failure counts, companion never wilts |
| V | The App Decides, User Vetoes — every screen completable on defaults alone |
| VI | **Offline-First** 🔒 — every P0 feature works in airplane mode, indefinitely |
| VII | Low-Stim By Default — and adaptive in *both* directions |
| VIII | **AI Is Optional** 🔒 — fully usable with AI off; never on a stake or crisis path |
| IX | Pure Domain Logic Is Test-First — the scorer and load model are pure TS, TDD'd |
| X | **Stakes Are Contracts, Not Punishments** 🔒 — ten conjunctive conditions |
| XI | **The Companion Is Not A Creditor** 🔒 — never mentions money, never shames |
| XII | **Location Is Sensitive By Default** 🔒 — precise location never leaves the device |
| XIII | Enforcement Is Friction, Never Lockout |

**Not a medical device.** No diagnosis, no dosing, no treatment or efficacy claims. Curriculum
content is framed as exercises, never as therapy or hypnotherapy. No claim to measure, manage, or
regulate dopamine or any other neurotransmitter.

## 4. Scope of v1

**In:** capture · the companion shell · the cross-system scorer · quests with time *and* place
triggers · route chains · the quest map · visual timers and transition alarms · automatic buffers ·
the dopamine menu · the overstimulation protocol · resetters · allostatic load · focus sessions and
distraction capture · journal and check-ins · soft currency.

**Deferred to P2:** commitment contracts, correlation views, curriculum content, place-aware
reach-outs, discovery quests.

**Deferred to P3** (needs other humans, a legal entity, or licensing): the moai, multiplayer body
doubling, community pot, experience discovery, activity matching.

**Rejected outright:** cryptocurrency, tokens, wallets, DAOs; pooling or redistributing user money;
drug interaction checking; anything diagnostic.

Full requirement set with acceptance criteria: `docs/01-prd.md`. Sequencing: `VISION.md` §11.

## 5. Distribution

Windows 11 development machine → Expo + EAS cloud builds → TestFlight → App Store. No Mac, no Xcode.
$99/yr Apple Developer Program is the only unavoidable cost; everything else runs on free tiers, at
roughly **$120/year** all-in. See `docs/06-shipping.md` and `docs/08-free-tier-stack.md`.

## 6. Document map

| Doc | Contents | State |
|---|---|---|
| `VISION.md` | **Narrative source of truth.** The loop, seven systems, competitor analysis, open decisions, risks, sequencing | ✅ v1 |
| `00-overview.md` | This file | ✅ v2.0 |
| `01-prd.md` | Numbered requirements, acceptance criteria, traceability to the constitution | ✅ v2.0 |
| `02-architecture.md` | Stack, sync model, AI integration, native extension | ⚠️ v1 — stack valid, scope stale |
| `03-data-model.md` | ERD, DDL, RLS pattern, local SQLite deltas | ✅ v2.0 |
| `design-system/MASTER.md` | **Design system source of truth.** Palette with measured contrast, type scale, motion, component rules, anti-patterns | ✅ v3 |
| `04-wireframes.md` | Navigation map, screens | ⚠️ v1 — screens stale; **tokens superseded by `design-system/MASTER.md`** |
| `05-toolchain.md` | Skills and MCP research, with verdicts | ✅ still valid |
| `06-shipping.md` | Windows → App Store, TestFlight, App Review health rules | ✅ still valid |
| `07-roadmap.md` | Phased plan and critical path | ❌ **superseded by `VISION.md` §11** |
| `08-free-tier-stack.md` | Zero-cost stack and where each wall is | ✅ still valid |
