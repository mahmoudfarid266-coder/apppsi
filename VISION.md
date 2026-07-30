# Vision Brief — the Companion App

**Status:** unstructured brainstorm → structured idea. This is the *input* document for Spec Kit,
not a spec. It deliberately contains product vision and open questions, which a `spec.md` may not.

**Source:** one brain dump, 2026-07-29, ~45 distinct ideas. §12 maps every one of them so nothing
is lost.

**Relationship to Rudder:** this supersedes and absorbs Rudder. Rudder's four pillars survive as a
subset (see §11). The constitution needs amending, not replacing — see §9.

---

## 1. The one sentence

> **An animal companion that knows where you are, what you've got left in the tank, and who you're
> drifting away from — and asks you for exactly one yes at a time.**

The companion is not a mascot painted onto a to-do app. That's Finch, and it's already done well.
The companion **is the decision engine**, given a face and a voice. The ADHD problem is not *"I
don't know what my tasks are."* It is *"I cannot choose, start, or feel time passing."* So the
product's job is to **decide** and ask for a yes — not to present a list and wait.

Your phrase for it — **shadow teacher** — is the right frame and it should survive into the product.
It teaches by walking beside you, it knows the parts of you that you avoid, and it does not flinch
at them.

---

## 2. Who it's for, and what it's actually fighting

Built for one person first (you), hardened for public release later.

| # | Failure mode | What it looks like at 6pm on a Tuesday |
|---|---|---|
| 1 | Working-memory collapse | The thought existed. It's gone. It was important. |
| 2 | Task-initiation paralysis | You know exactly what to do and cannot begin. |
| 3 | Time blindness | "Five minutes" was ninety. Leaving late, every time. |
| 4 | Decision fatigue | Twelve fine options, zero chosen, evening gone. |
| 5 | Shame spiral → abandonment | Missed three days, can't open the app, delete it. |
| 6 | Interoception gap | Didn't notice the crash coming. Again. |
| 7 | **Dopamine mismanagement** *(new)* | Reached for the cheap hit, got the hangover, repeat. |
| 8 | **Connection drift** *(new)* | Four months since you texted someone who matters. |
| 9 | **Solitude intolerance** *(new)* | Alone feels like failing, so you never rest properly. |

7–9 are new to this vision. They're the reason this isn't just a productivity app.

**Not a medical device.** No diagnosis, no dosing, no treatment claims, no efficacy claims. Ever.
This constraint gets *harder* now that the vision includes CBT, hypnosis, and meds — see §10.

---

## 3. The spine: one loop

Every single feature in this document is a stage of one loop. If a proposed feature doesn't fit a
stage, it doesn't belong in the product.

```
   ┌──────────────────────────────────────────────────────────┐
   │                                                          │
   ▼                                                          │
 SENSE ──▶ DECIDE ──▶ OFFER ──▶ DO ──▶ MARK ──▶ SETTLE ───────┘
   │          │          │        │       │         │
 where     pure       the      quest,  evidence:  currency,
 you are,  domain     companion break,  photo,    streak,
 time,     logic      speaks,   reach-  voice,    stake
 sleep,    picks      one card, out,    journal,  resolves
 meds,     ONE        yes/no/   med,    GPS, or
 charge,   next       swap      sit     just a
 who's     move                 alone   tap
 drifting
```

- **SENSE** — context ingestion. Location, time of day, calendar, sleep, meds taken, self-reported
  energy/overstim, days-since-contact per person, battery, weather.
- **DECIDE** — pure TypeScript, no React, no I/O, fully unit-tested. *This is where the product
  lives.* One scorer ranks every candidate action across all seven systems and returns one winner.
- **OFFER** — the companion. One card. Three affordances: **do it**, **not now**, **something
  else**. Never a list.
- **DO** — the action, whatever system it came from.
- **MARK** — proof/documentation. Deliberately low-friction: a tap is valid evidence for most
  things. Photo/voice/GPS reserved for things you *chose* to stake.
- **SETTLE** — the ledger. Currency earned, streak nudged, stake resolved.

**The scorer is the moat.** Any competitor can build a habit tracker. Nobody has a single ranking
function that will tell you "*text your brother*" is more important right now than "*finish the
slide deck*" because you're at 31% battery, you're overstimulated, and it's been 71 days.

---

## 4. The seven systems

Candidate actions come from seven systems. All seven feed one scorer. All seven render through one
companion.

### 4.1 Quests — the doing system

Tasks, errands, projects, and the thing you actually got excited about: **side quests bound to
place, not time.**

- A task can carry a **time trigger**, a **place trigger**, or both. Place is first-class, not an
  afterthought bolted on like Apple Reminders.
- Triggers on **arrive**, **leave**, **pass near**, and **while out** — the last one is the
  interesting one: a bundle of things that only make sense when you're already outside.
- **Route awareness:** you say "I'm heading to the gym." The companion looks at what's *on the way*
  and hands you a small chain of quests, ordered by geography, not by priority.
- **Decomposition:** a task too big to start gets broken into a chain where step one takes under two
  minutes. Works without AI (templates + your own past splits); better with AI.
- **Buffer time is automatic and non-negotiable.** Every quest with a place gets travel + a padding
  factor derived from *your* historical lateness, not from optimism.
- **Quest map** — see §6.2.

### 4.2 Rhythms — the recurring system

Habits, routines, schedule, sleep, medication.

- Habit tracker, but **streaks pause, never break** (constitution, non-negotiable).
- Sleep scheduler that works backwards from wake time and defends the wind-down window.
- **Medication reminders** — a *log and a nudge*, never a dosing engine. It never suggests, adjusts,
  or comments on what or how much. It records what you tell it and reminds you at times you set.
- Correlation views over time: sleep vs. energy, meds vs. focus, exercise vs. mood. **Shown as
  observation, never as advice.**

### 4.3 Regulation — the nervous-system layer

This is the piece almost nobody ships, and it's the second-biggest differentiator after location.

- **Dopamine menu** — the established ADHD community tool (Jessica McCabe / *How to ADHD*),
  structured as starters / mains / sides / desserts / specials. Desserts are the cheap hits you can
  overdo; the app knows the difference and never pretends it doesn't.
- **Substitution, not prohibition.** When you reach for a dessert, the companion doesn't block it —
  it offers the nearest main that scratches the same itch, once, then gets out of the way.
- **Overstimulation protocol** — a state you can declare in one tap, which collapses the entire UI
  to one action and silences everything else until you come back.
- **Resetters** — short, concrete, physical: cold water, walk around the block, box breathing, lie
  on the floor for four minutes. Chosen by what state you're in and what's available where you are.
- **Allostatic load** — a slow-moving "how loaded are you" reading assembled from sleep debt,
  missed breaks, overstim declarations, and social depletion. It **damps the scorer**: when load is
  high, the app stops asking you for hard things. This is the single most important safety valve in
  the design.
- **Enforced breaks & meditation** — see the open question on "enforce" in §9.

### 4.4 Bonds — the relationship system

A personal CRM, but the ADHD version: not for networking, for **not losing people**.

Your own tiers, kept verbatim because they're better than the generic ones:

| Tier | Example default cadence |
|---|---|
| Myself | daily |
| Relationship | daily / continuous |
| Family | weekly |
| BFF | weekly |
| Close friends | biweekly |
| Rizz | while it's live, every few days |
| Hangout | monthly |
| Coworker | as-needed |
| Bizz | quarterly |

- **`myself` being in the tier list is the best idea in the dump.** Self is a relationship with a
  cadence, and it wires Bonds directly into Solitude (§4.5). Keep it.
- Per-person: last contact, last *thing* you talked about (so you can open with it), a cadence, and
  a drift score.
- **Hangouts, not just texts.** The system tracks in-person time separately, because for this
  problem a text is not a substitute.
- Drift feeds the scorer. "Text X" competes for the one card on equal footing with "do the dishes."
- Competitors do the reminder half (Dex, Clay). Nobody ties it to your energy state or your
  location — *"you're 400m from their neighbourhood and it's been 3 months."*

### 4.5 Solitude — the self system

Not a feature so much as a **quest category with its own curriculum**: learning to be alone without
it registering as failure.

- Solo side quests: eat at a restaurant alone, go to a film alone, take yourself somewhere new.
- Self-maintenance: hygiene, room, laundry, the stuff that quietly collapses first and that you
  named as "cleaning oneself."
- Loneliness work as *skill acquisition*, not as consolation prize for having no plans.
- Feeds from the `myself` tier in §4.4 — the app schedules dates with you.

### 4.6 Record — the memory system

Second brain, and the evidence layer for everything else.

- Fast capture: text, voice, photo. **Under 2 seconds from lock screen to typing** (constitution,
  non-negotiable).
- Journaling and **self-recording as documentation of progress** — video/voice logs over months,
  which is a genuinely powerful ADHD intervention because it externalises change you can't feel.
- Auto-assembled retrospectives: weekly, monthly. The companion narrates what it saw.
- Records are the substrate the companion draws on to sound like it knows you.

### 4.7 Stakes — the consequence system

Currency, forfeits, the moai, the community pot. **This is the most dangerous system in the
document — legally, financially, and psychologically.** See §9 and §10 before building any of it.

- **Soft currency** earned by completing things. No cash value. Spends on companion cosmetics,
  unlocks, quest rerolls. Zero legal exposure. Ship this.
- **Moai** — a fixed small group (5–10, per the Okinawan original) who see each other's commitments
  and outcomes. The original moai is about *mutual support and pooled resources*, not fines. **The
  social version is the true one** and it's free of the entire legal problem below.
- **Real-money forfeits** — the version you described (don't leave the house → GPS catches it →
  money moves). Evidence for commitment devices is real (a BMJ RCT found ~50% goal attainment vs
  ~10% control; Forfeit claims 94% task completion). It also directly contradicts a non-negotiable
  principle. This is §9's headline fork.
- **Community pot / DAO / crypto** — as described, this is a regulated money-transmission business,
  not a feature. See §10.

---

## 5. The companion

The single most important design object in the product. Get this wrong and nothing else matters.

**Role:** shadow teacher. Knows your patterns, including the ones you don't like. Never surprised by
a bad week. Has opinions. Is not a cheerleader.

**Voice rules (draft):**
- Warm, dry, brief. Never chirpy. Never uses exclamation marks to manufacture enthusiasm.
- Never shames, never guilt-trips, never references a broken streak as a loss.
- Comments on *patterns*, not *incidents*. "Third Tuesday in a row" is useful; "you failed today" is
  not.
- Has one job per screen: hand you one card.
- **Never speaks about money.** See below.

**The hard split:** if real-money stakes ever ship, the companion must be entirely walled off from
them. The companion's voice stays warm and never mentions a stake, never announces a charge, never
congratulates you for not being charged. Stakes live on a separate, cold, silent ledger screen you
have to go and look at. **A warm animal that takes your money is a betrayal object.** Split them or
don't build stakes.

**Growth:** the companion changes with sustained use — but on **cumulative** contribution, never on
current streak. It never gets sick, sad, or neglected-looking when you disappear for two weeks. That
is a punishment mechanic wearing a cute hat, and it is the specific reason people quit pet apps in
shame.

**Species/design:** open. Should be decided with the no-red, low-stim palette in hand, not before.

---

## 6. Three surfaces

### 6.1 Now
The companion and one card. The default screen. This is 90% of daily use. Everything else is a
detour you have to deliberately take.

### 6.2 The Map
Where side quests live. Strava-shaped in that it renders your actual movement, but the pins are
**intentions, not achievements**.

- Your places, your routes, your quest pins, your "while you're out" bundles.
- **Experience discovery** — the "Bump for new experiences" idea: places you've never been, filtered
  to things you'd actually do. This is a strong, distinct feature.
- **Friend/activity matching** — genuinely appealing and genuinely the riskiest thing here.
  Non-negotiable if built: place-level not point-level, never real-time, opt-in per place, mutual
  consent before any reveal, no location history ever exposed, block/report from day one. See §10.

### 6.3 Record
Journal, voice logs, photos, retrospectives, correlation views, the ledger.

---

## 7. The curriculum

CBT, shadow work, hypnosis, emotional intelligence, and tips are **not systems** — they're a content
library the companion draws from, delivered as short exercises attached to the right moment.

- **CBT-derived exercises** for task initiation, catastrophising, and RSD. Framed as exercises,
  never as therapy.
- **Shadow work** prompts as journaling, tied to patterns the app has actually observed.
- **Hypnosis / guided audio** for sleep onset and wind-down. This is guided audio. It is not
  clinical hypnotherapy and must never be described as such.
- **Emotional intelligence** — naming states, granularity practice, feeding the interoception gap
  (failure mode 6).

Delivery rule: **content arrives because the moment called for it**, never as a library you're
expected to browse. A courses tab is a graveyard.

---

## 8. Competitive landscape

Nothing here is a direct competitor. That's the good news and it's also the warning — the reason
nobody has built this is that it's seven products.

| Product | Does well | Leaves open |
|---|---|---|
| [Finch](https://apps.apple.com/us/app/finch-self-care-pet/id1528595748) | The companion bond; genuinely blame-free; friend codes without a public feed. The closest thing to a competitor. | Companion is a wrapper, not a decision engine. No location. No task depth. |
| [SideQuest (city-as-game)](https://www.trysidequest.app/) | Location quests, XP, city exploration | Entertainment, not executive function. Doesn't know your life. |
| [Sidequest IRL (OSS)](https://github.com/JustakCZ/Sidequest) | Offline-first gamified to-dos, RPG contracts | Generic task reskin; no context awareness |
| [QuestUpon](https://apps.apple.com/ca/app/questupon-augmented-reality/id480529333) | Location + AR storytelling | Tourism |
| Apple Reminders / [GeoNote](https://geonote.net/en/) / Geo Alert | Geofenced reminders that work | Dumb triggers. No sequencing, no route awareness, no state awareness |
| [Dex](https://getdex.com/blog/dex-vs-clay/) / Clay | Per-contact cadence, keep-in-touch nudges, daily digest | Networking tools. No hangouts, no energy state, no location tie-in |
| [Beeminder / StickK / Forfeit](https://www.accountablo.com/blog/apps-that-charge-you-money) | Real stakes, proof via photo/GPS, strong outcome data | Pure punishment model. Openly hostile-by-design. No warmth to protect |
| Habitica | Deep RPG gamification, parties | Overhead collapses under ADHD; complexity is the failure |
| [Tiimo / Structured / Sunsama](https://www.morgen.so/blog-posts/adhd-productivity-apps) | Visual time, routine execution | Tiimo: routines only, no general tasks. Structured: reported as overwhelming. Sunsama: weak mobile, doesn't roll over unfinished work |

**The gap, stated precisely:** every existing product owns one system. None of them **share a single
scorer**. The unclaimed position is *the app that weighs a text to your brother against the dishes
against a nap, using where you are and what's left in the tank.*

**Steal from Finch:** the blame-free tone and the friend-code model (accountability with no public
feed). **Steal from Forfeit:** proof-of-completion UX. **Do not steal Forfeit's philosophy.**

---

## 9. Open decisions — the actual forks

These change what gets built. They're yours to call, not mine.

### D1 — Real-money forfeits vs. Principle IV 🔒 *(the headline)*
Constitution v1.0.0 marks **No Punishment Mechanics** NON-NEGOTIABLE, and failure mode 5 is
literally *shame spiral → abandonment*. Charging money on failure is punishment with a receipt, and
it attacks the app's own thesis. But the outcome data for commitment devices is real, and you asked
for it on purpose.

This is a **productive tension**, not a mistake. Three resolutions:
- **(a) Social stakes only** — moai witnesses, no money. True to the Okinawan original, zero legal
  surface, doesn't violate Principle IV (witness ≠ penalty). *My recommendation for v1.*
- **(b) Contract model** — money allowed, but: opt-in per quest, never default, amount and
  destination set in advance while regulated, hard monthly cap, cooling-off period, one free unwind
  per month, destination is always something you endorse (never an anti-charity, never the app), and
  the companion is walled off entirely. Requires amending Principle IV with an explicit clause.
- **(c) Full forfeit** as described. Requires *deleting* Principle IV, which I'd argue guts the
  product.

**Regardless of choice: never let GPS alone trigger a charge.** GPS drift, dead battery, and indoor
false-negatives are routine. Being charged for something you actually did is the fastest possible
way to destroy trust in a companion app. Any money movement needs a human confirmation step.

### D2 — What "enforce" means
You said *enforcing* breaks, *enforcing* meditation, *making* me. Reaching for external structure is
exactly right for ADHD. But "enforce" in software means blocking, and lockouts get resented and
uninstalled. Options: **hard lock**, **friction** (15-second deliberate override), or **the
companion simply won't offer anything else until you break**. I'd pick friction.

### D3 — Solo-first vs. social-first
Constitution says personal tool first, dogfood daily. Moai, community pots, giveaways, and friend
matching **cannot be dogfooded by one person**. They need N users, a backend, moderation, and safety
review. This is a sequencing constraint, not a scope cut: everything social lands after the solo app
is your daily driver.

### D4 — Is this Rudder, or a new project?
My read: it's Rudder with a companion layer that supplies the coherence Rudder lacked. ~80% of the
existing spec work survives. Recommendation: keep the repo and git history, amend the constitution,
rewrite `00-overview.md` and `01-prd.md`, add new docs. Also: **delete `specs/001-capture-sync/`** —
it has three unresolved clarifications and is now stale.

### D5 — Name
"Rudder" was chosen for a steering metaphor. A companion-led app might want a name that's a
creature, not an instrument. Undecided; not blocking.

---

## 10. Hard constraints & risks

| # | Risk | Reality |
|---|---|---|
| R1 | **Scope** | ~45 features. Rudder's own roadmap was 20 weeks for 4 pillars and named scope creep as risk #1. As described this is **18–30 months solo**. The vision holds all 45; v1 ships ~8. |
| R2 | **Money transmission** | Holding user funds and redistributing them to other users is regulated (US: state MTL; EU: e-money). Not a "later" problem — it's a licensing problem. |
| R3 | **Apple 3.1.1 / 3.1.5** | Soft currency with real value → must use IAP. Crypto apps require **organization** enrolment (you're an individual) plus per-region licensing. Person-to-person gifts avoid IAP *only* if optional and 100% reaches the recipient — a pot with giveaways and competitions is not that. **Recommendation: do not build a DAO or token.** |
| R4 | **Prize competitions** | "Rewards for the most disciplined" + pooled money = gambling/sweepstakes law in many jurisdictions. |
| R5 | **Location + social = stalking vector** | Non-negotiables in §6.2. Also gets specific App Review scrutiny. |
| R6 | **Health claims** | Hypnosis, CBT, meds, "dopamine management" all raise Guideline 5.1.3. Log and nudge — never diagnose, dose, treat, or claim efficacy. PHI never touches iCloud. Never call the app a treatment. |
| R7 | **"Dopamine nutritionist"** | Great metaphor, loose neuroscience. Use *dopamine menu* (the established community term) and never claim to measure or regulate actual dopamine. |
| R8 | **Battery** | iOS geofences are OS-managed and cheap (≤20 regions). Continuous background GPS is not. Strava-style tracking must be session-scoped, not always-on. |
| R9 | **Offline-first** 🔒 | Geofences and local notifications work offline — fine. Community funds and matching do not. Another reason social lands last. |
| R10 | **Windows dev machine** | Unchanged. Expo + EAS cloud builds. Live Activities need a small Swift extension, still v1.1. |

---

## 11. Proposed sequencing

Cut on the question: **what makes this *this* app and not Finch or Todoist?** Answer: the companion
decides, context includes place, and regulation is first-class.

| Phase | Ships | Why here |
|---|---|---|
| **0** | Foundations, constitution amendment, design tokens, Apple enrolment | Enrolment takes 24–48h+ and gates everything |
| **1** | Capture + sync + **the companion shell** | Your daily driver starts. Companion exists from day one or the app's identity never forms |
| **2** | Quests with time triggers, one-card Now screen, visual timer, buffers | This is Rudder P1+P2. Now it's usable |
| **3** | **Place triggers, geofences, quest map, route chains** | The first true differentiator |
| **4** | **Regulation: dopamine menu, overstim protocol, resetters, allostatic damping** | The second differentiator. Also the thing that keeps you using it in bad weeks |
| **5** | Record: journal, voice logs, retrospectives | Compounds — the earlier it starts collecting, the better, but it can lag |
| **6** | Rhythms: habits, sleep, meds | Meds last on purpose — triggers health scrutiny at review |
| **7** | Bonds: personal CRM, tiers, cadence, drift | Solo-usable, high value, no backend risk |
| **8** | Solitude quests + curriculum content | Cheap once quests exist — mostly content |
| **9** | Soft currency + gamification pass | Only meaningful once there's enough to earn from |
| **10+** | Moai, social, matching, experience discovery, any real-money stakes | Needs other humans, moderation, safety review, and legal work |

**The rule that matters more than the order:** do not start phase N+1 until phase N has been in real
daily use for a week. An ADHD app you don't use is an expensive way to procrastinate.

---

## 12. Raw capture — nothing dropped

| # | Your idea | Lands in |
|---|---|---|
| 1 | ADHD animal accountability buddy | §5 Companion |
| 2 | "Shadow teacher" framing | §5 Companion |
| 3 | Not just habits + tasks — full organizer | §3 the loop |
| 4 | Alarm/reminder app | §4.1 Quests |
| 5 | Works on location, not just time | §4.1 place triggers |
| 6 | Break tasks by where you're going | §4.1 route chains |
| 7 | Side quest map | §6.2 Map |
| 8 | Side-quest competitor research | §8 |
| 9 | Habit tracker | §4.2 Rhythms |
| 10 | Scheduler | §4.2 Rhythms |
| 11 | Gamified plan | §4.7 soft currency, §9 D1 |
| 12 | Social CRM | §4.4 Bonds |
| 13 | Tiers: coworker/hangout/bizz/rizz/close/bff/relationship/family/myself | §4.4 table |
| 14 | Hangout cadence per tier | §4.4 |
| 15 | Last-contact / last-topic follow-up | §4.4 |
| 16 | Enforced breaks | §4.3, §9 D2 |
| 17 | Buffer times on tasks | §4.1 |
| 18 | Strava-like location + reminders | §6.2, R8 |
| 19 | Enforced meditation | §4.3, §9 D2 |
| 20 | Journaling | §4.6 Record |
| 21 | Self-recording as progress documentation | §4.6 |
| 22 | Accepting loneliness | §4.5 Solitude |
| 23 | "Cleaning oneself" / self-maintenance | §4.5 |
| 24 | Fun hanging out alone | §4.5 solo quests |
| 25 | Medication reminders | §4.2, R6 |
| 26 | Sleep scheduler | §4.2 |
| 27 | Hypnosis | §7, R6 |
| 28 | Shadow work | §7 |
| 29 | CBT for executive dysfunction | §7 |
| 30 | Tips | §7 delivery rule |
| 31 | Emotional intelligence | §7 |
| 32 | Dopamine cycles + overstimulation | §4.3 |
| 33 | What to do when overstimulated / how to avoid it | §4.3 protocol |
| 34 | Action/stimulation resetters | §4.3 resetters |
| 35 | Allostatic load resetting | §4.3 damping |
| 36 | Dopamine menu / "dopamine nutritionist" | §4.3, R7 |
| 37 | Healthy dopamine replacing bad | §4.3 substitution |
| 38 | Second brain | §4.6 |
| 39 | Forfeit accountability as payment | §4.7, **§9 D1**, R2–R4 |
| 40 | Currency per task, funded by forfeits | §4.7, R3 |
| 41 | Location-tracked forfeit (didn't leave house) | §9 D1 — **GPS must never auto-charge** |
| 42 | Moai concept | §4.7, recommended as the social-stakes answer |
| 43 | Documentation requirement for progress + funds | §4.6 MARK stage |
| 44 | Community funds for hobbies/tools/competitions | §4.7, R2–R4 — phase 10+ |
| 45 | Giveaways + rewards for the disciplined | R4 gambling exposure |
| 46 | DAO / crypto / "you choose what's better" | R3 — **recommendation: neither** |
| 47 | Friend matching on activities + locations | §6.2, R5 |
| 48 | "Bump"-style map for new experiences | §6.2 experience discovery |

---

## 13. Next steps in Spec Kit

Order matters — the constitution gates everything downstream.

1. **`/speckit-constitution`** — amend to v2.0.0. Required changes:
   - Principle IV gets an explicit **stakes clause** resolving D1
   - New principle: **companion voice** (never shames, never punishes, walled off from money)
   - New principle: **location privacy** (place-level, never real-time, mutual consent)
   - New principle: **no health claims** (log/nudge only; never diagnose, dose, or treat)
   - Restate the scorer as the single arbiter — one card, never a list
2. **Rewrite `docs/00-overview.md` and `docs/01-prd.md`** from this brief
3. **Delete `specs/001-capture-sync/`** — stale, three unresolved clarifications
4. **`/speckit-specify`** the phase-1 slice only: *capture + sync + companion shell*
5. **`/speckit-clarify`** — do not skip. Ambiguity here becomes wrong code at `implement`
6. **`/speckit-plan`** → Constitution Check runs against the amended gates
7. **`/speckit-tasks`** → **`/speckit-implement`** in batches, not all at once
