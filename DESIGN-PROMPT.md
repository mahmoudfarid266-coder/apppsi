# Design Prompt — Rudder

**Paste this whole file into a fresh session.** It is self-contained: everything needed to design
every screen of this app, with nothing to look up elsewhere.

---

## 0. Your task

Design the complete mobile UI for **Rudder**, an ADHD executive-function companion for **iPad and
iPhone**. Produce every screen listed in §8, in both light and dark themes, honouring every
constraint in §2–§7.

**Primary device: iPad Air (10.9″, 1180 × 820 pt landscape / 820 × 1180 pt portrait).** It must also
work at Split View and Slide Over widths. Phone is secondary but supported.

Deliver: high-fidelity screens, the app icon, and any component specs a developer would need.

---

## 1. What the app is

> **An animal companion that knows where you are, what you've got left in the tank, and who you're
> drifting away from — and asks you for exactly one yes at a time.**

It is **not** a to-do app with a mascot. The companion **is the decision engine, given a face.** The
ADHD problem is not "I don't know my tasks" — it's "I can't choose, start, or feel time passing." So
the product decides and asks for one yes.

**One loop:** `SENSE → DECIDE → OFFER → DO → MARK → SETTLE`

**Seven systems feed it:** Quests (tasks, place-bound side quests) · Rhythms (habits, sleep,
medication) · Regulation (dopamine menu, overstimulation, resets) · Bonds (personal CRM) · Solitude
(being alone as a skill) · Record (journal, progress) · Stakes (XP).

---

## 2. Non-negotiable design rules

These are product decisions, not preferences. **Breaking any of them breaks the product.**

### 2.1 No red. Anywhere.

The only exception is a permanent-deletion confirmation dialog, and there it must be an **outline,
never a fill**.

Overdue, error, warning, validation → use the accent or muted ink. **Never red.**

*Why:* red signals failure, and failure signals are what drive ADHD app abandonment. ~50% of habit-app
users are gone by day 60. This rule is the product's retention strategy.

### 2.2 Nothing counts what the person didn't do

No failure totals. No completion percentages. No "3 overdue". No badges. No red dots. A three-week-old
item looks **exactly** like a fresh one.

### 2.3 Progress fills, never drains

Every progress indicator moves in one direction only. No depleting bars, no HP, no hearts, no stat
decay, no character sickness.

### 2.4 Streaks fade as they grow

A streak of 5 may be visible. A streak of 30 is **not shown on the home surface at all**.
*Why:* streak anxiety scales with length — the longer it runs, the more a miss costs.

### 2.5 The companion never wilts

There is no sad, sick, hungry, neglected, or disappointed state. Returning after 60 days looks
identical to returning after 1 day. Never show how long someone was away.

### 2.6 One card, one action

The Now screen shows **exactly one thing** with exactly three affordances: **Do it** · **Not now** ·
**Something else**. Never a list. One filled button per screen, ever.

### 2.7 Low-stim by default

Reduce Motion → **0ms, not "reduced"**. No gradients, no parallax, no confetti, no glow, no blur.
WCAG 2.2 AA minimum. Touch targets ≥48pt. Dynamic Type to XXL without clipping.

### 2.8 Calm ≠ timid

Low-stim constrains *motion, gradients, and colour noise* — **not type scale**. The design is
**bold**: enormous type, high contrast, generous emptiness. Big type means fewer elements per screen,
which is *less* cognitive load. Confident, not loud. Quiet, not meek.

---

## 3. Colour

**Warm ink on warm paper, with one accent.** All ratios below are measured.

### Light

| Token | Hex | Contrast | Use |
|---|---|---|---|
| `paper` | `#FDF4EC` | — | App background. Soft apricot |
| `surface` | `#FFFFFF` | — | Cards |
| `sunken` | `#F9DBBD` | — | Wells, progress tracks |
| `ink` | `#450920` | **14.72:1** AAA | Display, body, **and the primary button fill** |
| `inkSecondary` | `#6E4A52` | **6.99:1** AA | Supporting copy |
| `inkMuted` | `#8A6069` | **4.88:1** AA | Metadata. **Floor — nothing lighter** |
| `rule` | `#EEDCD3` | — | Decorative dividers only |
| `onInk` | `#FDF4EC` | 14.72:1 | Text on the ink button |
| `accent` | `#A53860` | **5.80:1** AA | Berry. Accent text + accent pill |
| `onAccent` | `#FFFFFF` | **6.30:1** | Text on the berry pill |
| `accentTint` | `#FFA5AB` | — | Cotton candy. **Decorative fill only, never text** |
| `destructive` | `#9D0208` | 7.90:1 | 🚫 Delete confirms ONLY, outlined |

### Dark

| Token | Hex | Contrast | Use |
|---|---|---|---|
| `paper` | `#24050F` | — | Deep bordeaux |
| `surface` | `#300714` | — | |
| `sunken` | `#1A040B` | — | |
| `ink` | `#F9DBBD` | **14.40:1** AAA | Soft apricot — display, body, **button fill** |
| `inkSecondary` | `#D3AE99` | **9.32:1** AAA | |
| `inkMuted` | `#A08578` | **5.55:1** AA | Floor |
| `rule` | `#43121F` | — | |
| `onInk` | `#24050F` | 14.40:1 | Dark text on the apricot button |
| `accent` | `#FFA5AB` | **10.17:1** AAA | Cotton candy |
| `accentAlt` | `#DA627D` | **5.46:1** AA | Blush, second weight |
| `destructive` | `#E5736B` | 6.34:1 | 🚫 Delete confirms ONLY |

### ⚠️ The accent SWAPS SWATCH between themes

Not a tint adjustment — **a different colour**:

| | Light | Dark |
|---|---|---|
| Accent | `#A53860` berry · 5.80:1 | `#FFA5AB` cotton candy · 10.17:1 |
| Same swatch in the other mode | `#FFA5AB` → **1.72:1** ❌ invisible | `#A53860` → **3.02:1** ❌ fails |

Reuse one across both and you get an invisible or failing accent. **`#FFA5AB` must never be text on
light paper.**

**Theme follows the system.** No theme question at onboarding.

---

## 4. Typography

**Space Grotesk (700) for display at ≥24pt. System face (SF Pro) for everything below.**

The hybrid is deliberate: Dynamic Type to XXL is a hard requirement, and custom fonts are the most
common cause of clipping at accessibility sizes. The custom face is confined to large display text.

| Role | Face | Size | Weight | Line height | Tracking |
|---|---|---|---|---|---|
| Hero | Space Grotesk | **36 / 44 / 52** by size class | 700 | 1.0 | −0.025em |
| Display | Space Grotesk | 32 | 700 | 1.05 | −0.02em |
| Title | Space Grotesk | 24 | 700 | 1.15 | −0.01em |
| Field input | System | 20 / 22 / 24 | 400 | 1.3 | 0 |
| Emphasis | System | 17 | 600 | 1.45 | 0 |
| **Body** | System | **17** | 400 | 1.5 | 0 |
| Supporting | System | 15 | 400 | 1.5 | 0 |
| Meta | System | 13 | 400 | 1.4 | 0 |

- **Sentence case and lowercase throughout. Never ALL CAPS, never Title Case.** Screen titles are
  lowercase: `now`, `places`, `rhythms`, `people`, `reset`.
- **The one thing that matters is enormous.** One hero element per screen.
- Tabular figures for every timer, count, and XP value.
- Hierarchy from size and weight — **never colour**, since there is only one accent and it is
  spoken for.

---

## 5. Space, shape, motion

```
space:  4 · 8 · 12 · 16 · 24 · 32 · 48 · 72 · 112
radius: field 14 · card 18 · pill 999
```

- **All primary buttons are full-width pills, 56pt tall.**
- Text fields use a **2px ink underline**, never a light box outline.
- Touch targets ≥48pt, 8pt minimum gap.

**Motion:** micro 150ms · enter 200ms · exit 120ms · **Reduce Motion → 0ms on everything, companion
included.** Transform and opacity only. Press feedback is opacity, never a transform that shifts
layout. One or two elements in motion per view, maximum.

---

## 6. iPad layout

**The single most important rule: content never spans full width.**

```
content-max: 620pt, centred, minimum 48pt gutters

┌──────────────────────────────────────────────────────┐
│           ┌────────────────────────────┐             │
│           │  what's on your mind?      │             │
│           │  ────────────────────────  │  ≤620pt     │
│           │  ▓▓▓▓▓ hold it ▓▓▓▓▓       │             │
│           └────────────────────────────┘             │
│                      1180pt                           │
└──────────────────────────────────────────────────────┘
```

Size classes: `compact` ~320pt (Slide Over) · `narrow` ~375pt (Split ⅓) · `medium` ~590pt (Split ½) ·
`wide` 820pt (portrait) · `widest` 1180pt (landscape).

Below 620pt the column is just screen-minus-gutters, so one layout serves all five. The pill is
full-width **of the column**, never of the screen. All four orientations. No horizontal scroll ever.

**A wider screen means more whitespace around one action — never more actions.**

Hardware keyboard is a first-class path: field focused on launch, `Return` commits, `Escape` clears,
a full capture completable with **zero taps**.

---

## 7. The companion and the logo

### The crow

Watchful, unsentimental. A crow noticing your patterns reads as *intelligence* rather than devotion —
that's the "shadow teacher" posture. It also cannot plausibly be drawn as neglected, which the design
needs.

- Flat silhouette, drawn in `ink` and `inkSecondary` only. **Never in accent or destructive.**
- Exactly three states: **idle** · **attentive** (person is typing) · **acknowledging** (a capture
  landed). The only difference between them should be subtle — where it's looking, a slight tilt.
- **No fourth state exists.** Do not design sad, sleeping, hungry, or dusty variants.
- Present but not decorative. It should feel like something sitting nearby, not a mascot performing.

### App icon brief

- **Concept:** the crow silhouette, or a single distilled mark derived from it (a beak-and-eye,
  a wing curve).
- **Palette:** apricot `#F9DBBD` ground with bordeaux `#450920` mark, or the inverse. Flat, no
  gradient, no shadow, no glow.
- Must read at 1024px and at 40px. No text in the icon.
- Should look calm on a home screen full of loud icons — **restraint is the differentiator.**

---

## 8. The path — navigation and screens

### 8.1 The journey

```
FIRST RUN
  onboarding (6 screens, every one skippable, <90s)
        │
        ▼
  ┌── CAPTURE (initial route, always) ───────────────────┐
  │   the fast path. <2s cold launch to typing.          │
  └───┬──────────────────────────────────────────────────┘
      │  header links
      ├──► NOW      one card, the decision engine
      ├──► PLACES   map + place-bound quests
      └──► INBOX    review captures
                │
    NOW is the hub for everything else:
      ├──► RHYTHMS   habits, cadence
      ├──► CARE      medication + sleep
      ├──► PEOPLE    the CRM
      ├──► RESET     dopamine menu, overstim, check-in, journal
      ├──► FOCUS     timer + enforced break
      ├──► SOLITUDE  solo quests + curriculum
      └──► RECORD    journal history, progress logs, trends
```

**Capture is always the launch screen.** It is the one thing that must never be more than a tap away.

---

### 8.2 Screens to design

Mark each with the size classes you're showing. **All screens need light and dark.**

#### ① Onboarding — 6 screens, all skippable
1. *"What breaks most often?"* — multi-select from nine failure modes
2. **Meet the crow — name it.** One field, skippable with a default
3. Medication? yes/no → name + times (skippable)
4. Energy curve — three taps (morning / afternoon / evening)
5. Permissions, one at a time, each framed by what it does. Never a wall
6. *"Dump three things on your mind"* → becomes the first inbox items

Skipping everything must land on a working capture screen with no dead end.

#### ② Capture — the initial route
Crow top-left, nav links top-right. Hero: *"What's on your mind?"* Companion line beneath
(*"You're here."* → *"Held."* after saving). Field at the bottom with a 2px ink underline. Full-width
ink pill: **hold it**. Hint: *"No fields. Return keeps going."*

#### ③ Now — the one card
The action title in **hero, 52pt on iPad**. A short reason line beneath in accent (*"you're here"*,
*"overdue"*). One ink pill **Do it**, with **Not now** and **Something else** as plain text below.
XP top-right, tiny, muted. A bottom row of destinations. At the very bottom: *"It's too much right
now"*.

**Overstimulated state:** everything collapses. Only regulation options appear. Copy changes from
*"one thing."* to *"just this."*

**Empty state:** *"Nothing needs you right now."* in hero size. Not an error, not an illustration —
sufficiency.

#### ④ Places (map)
Map at ~260pt tall with rounded corners, place markers, accent-tinted radius circles. Ink pill
**Remember this place**. Below: list of places, each showing count waiting and radius. Tapping
expands to show quests plus a field: *"what, when you're here?"*

**Permission-denied state** is a required design: a plain list, no map, a **Use my location** pill,
and the line *"Everything works without it."*

#### ⑤ Inbox
Hero `inbox`, neutral count in muted (*"12 unread"* — never a badge, never coloured). Items newest
first with plain relative dates. **A three-week-old item must look identical to today's.**
Empty: *"Nothing needs you right now."*

#### ⑥ Rhythms
Habits as *"3 of 5 this week"* with a **filling** track. No streak numbers. Add-row with a title
field and a small `/wk` count. Subtitle: *"Times per week, not every day. A quiet week is arithmetic,
not a failure."*

#### ⑦ Care — medication and sleep *(not yet built)*
Meds list with one-tap **taken / skipped / late**, dose as free text. **No adherence percentage
anywhere.** Sleep computed backwards from wake time: wind-down at X, bed at Y. A visual night arc is
welcome. No sleep score, no quality rating.

#### ⑧ People
Sorted by drift, most drifted first. Each row: name, plain time since (*"4 months"* — no adjective,
no colour), tier and cadence, last topic. Expanded: a *"what did you talk about?"* field and three
pills — **message / call / hangout**. Add-row with a horizontal scroll of tier chips.

Tiers: `myself` · `relationship` · `family` · `bff` · `close friends` · `rizz` · `hangout` ·
`coworker` · `bizz`. **`myself` is a real tier with a real cadence.**

#### ⑨ Reset — regulation
One-tap **It's too much right now** pill at the top. Two-tap check-in: five numbers, 48pt targets.
The **dopamine menu** grouped by course — *starter · main · side · dessert · special* — each with a
hint. Add-to-menu row with course chips. A journal field at the bottom.

**`dessert` is the person's own label.** Never style it as a warning. No red, no caution icon.

#### ⑩ Focus — timer *(not yet built)*
A **draining disc** as the primary representation, numbers subordinate and small. Duration chips
10/15/25/45/90. A single always-visible field to send an intruding thought to the inbox **without
ending the session**.

**Break prompt:** the break is pre-selected and one tap. Declining is possible and costs ~15 seconds
of deliberate interaction — **but never a watched countdown, never guilt copy, and never recorded.**

#### ⑪ Solitude *(not yet built)*
Six escalating solo quests: coffee alone → walk → meal out → film → somewhere new → a day out. Show
as a path, not a checklist. Framed as **skill acquisition, never consolation.** Plus self-maintenance
rhythms (shower, sheets, laundry) — never counted as failures.

#### ⑫ Record *(not yet built)*
Journal history, progress logs (periodic self-recorded entries, played back on the anniversary before
recording the next), and trend views. **Every chart carries a persistent disclaimer:** *"This is a
personal log, not medical evidence. Correlation is not causation."* No p-values, no recommendations.

#### ⑬ Delete confirm — the only red
*"Delete permanently?"* Outlined `#9D0208` **Delete** and a filled ink **Keep it**. The destructive
option is the *outlined* one and the safe option is the *filled* one — deliberately.

#### ⑭ Settings
Theme override, personality on/off (plain-language mode must be a **supported path, not degraded**),
notification cap, export, delete account.

---

## 9. Voice and copy

Warm, dry, brief. **No exclamation marks. No emoji.** Lowercase screen titles.

Banned outright: money words · *fail / failed / missed / behind / should have* · *don't forget* ·
*overdue / remaining / days since* · *welcome back* or any reference to how long someone was away.

The companion's entire vocabulary is 12 strings: *"You're here."* · *"Hello again."* · *"Got it."* ·
*"Held."* · *"That's safe now."* · *"Noted."* · *"Nothing needs you right now."* and a merge notice.

Empty states read as **sufficiency**, never absence. *"Nothing needs you right now"*, never *"0 items"*.

---

## 10. Anti-patterns — do not design these

| Never | Why |
|---|---|
| Red for overdue, error, or warning | Amber-equivalent is the ceiling; here it's the accent |
| A badge or red dot on any icon | A count of things not done |
| Streak counters growing more prominent | Streak anxiety scales with length |
| A sad, sleeping, or neglected companion | The single biggest cause of shame-driven uninstalls |
| Completion percentages or failure rates | Nothing counts what wasn't done |
| Depleting bars, HP, hearts, stat decay | Named in research as anxiety triggers |
| Leaderboards or comparison to anyone | |
| More than one filled button per screen | One action |
| Content spanning 1180pt | Use the 620pt column |
| ALL CAPS anything | Reads as shouting |
| Gradients, glow, blur, confetti | Low-stim |
| Emoji as structural icons | Untokenizable, platform-inconsistent |
| A count on the home-screen widget | Most visible surface the person owns |

---

## 11. Deliverables

1. **App icon** — 1024px, plus a 40px legibility check
2. **All 14 screens**, light and dark
3. **Key screens at three widths** — 375pt (Slide Over/phone), 820pt (iPad portrait), 1180pt
   (iPad landscape)
4. **Companion sheet** — the crow in its three states, at 30pt and at hero size
5. **Component specs** — pill, text field, chip, list row, progress track, tier chip, the delete
   dialog
6. **Empty and denied states** for capture, inbox, places, people
7. **The overstimulated state** of the Now screen

Use the exact hex values in §3. Use the exact type scale in §4. If a design decision conflicts with
§2 or §10, **§2 and §10 win** — those rules exist because breaking them is what makes ADHD users
delete apps.
