# Design System: Rudder — MASTER

**Global source of truth.** Page-specific deviations live in `design-system/pages/<page>.md` and
override this file. Absent a page file, these rules apply exclusively.

**Version** 2.0 · 2026-07-30 · **Stack**: React Native (Expo SDK 57) + NativeWind v4
**Governed by**: `.specify/memory/constitution.md` v2.0.0 — Principles IV (no punishment) and
VII (low-stim) are NON-NEGOTIABLE and outrank every aesthetic preference below.

**Direction: Bold Minimalism.** Ink on paper, enormous type, almost no colour, generous emptiness.
Confident, not loud. Quiet, not timid.

---

## 0. Why v2 replaced v1

v1 was rejected on review. The error is worth recording because it is easy to repeat:

> **"Low-stim" was misread as "visually timid."** It is not. Principle VII constrains *motion,
> gradients, translucency, and colour noise*. It says nothing about type scale. Large type means
> **fewer elements per screen**, which is *less* cognitive load, not more — and higher contrast is
> better for accessibility, not worse. v1 produced a meek interface and mistook that for a calm one.

Reference direction (owner-supplied): Strava's oversized numerals — the one number that matters is
enormous — and pushr's near-monochrome lowercase display type with full-width black pill buttons.

| Source | Verdict |
|---|---|
| `--design-system --variance 8` → **Brutalism** (raw, stark, high contrast, WCAG AAA, 700+ type) | ✅ **Adopted in part.** Its contrast and type weight are right |
| Brutalism's sharp 0px corners, visible grid, uppercase everything, "anti-design" | ❌ **Rejected.** The references use pill buttons and lowercase. Aggression is not the goal — confidence is |
| `--domain typography` → **Space Grotesk as single dominant family, 700–900 display** | ✅ **Adopted.** This is the pushr wordmark look |
| That pairing's `ALL CAPS`, `letterSpacing 2`, uppercase nav | ❌ **Rejected.** Lowercase throughout — sentence case is calmer and matches the references |
| Navy `#0F172A` + blue `#0369A1` accent | ⚠️ **Replaced.** Near-monochrome instead; the app has exactly one colour and it is reserved for attention |
| Playfair Display / Source Serif 4 | ❌ **Rejected.** Editorial serif is the wrong voice for a tool |
| GSAP snippet | ❌ **Rejected.** DOM-based; will not run in React Native |
| `Destructive #DC2626` | ✅ **Kept, quarantined** to destructive confirms only |

---

## 1. Colour

**Palette A** (owner-selected, 2026-07-30). Bordeaux ink on apricot paper, berry as the single
accent. Every ratio below is measured, not estimated.

### Why this palette rather than the fire ramp

The alternative supplied ramp (`#6a040f` → `#ffba08`) was rejected: **six of its ten swatches are
alarm reds**, which Principle IV bans outright, and using it would have meant carrying a permanent
quarantine table and hoping nobody reached into the middle of it.

Palette A contains **no alarm red at all.** Berry-crush reads as wine, not error. There is nothing to
quarantine, which makes the no-red rule enforceable by the palette's own composition rather than by
discipline. That is a structural advantage, not a stylistic one.

### The one hard rule

> **No red anywhere except a destructive-action confirmation dialog.** The most severe attention state
> in the product is berry. Red signals failure; failure signals drive ADHD app abandonment
> (Principle IV).

Overdue, error, warning, and validation states use `--accent` or `--ink-secondary`. Never red.

### The rose asymmetry — the practical rule that will bite if forgotten

**The palest rose is decorative-only on light paper and becomes the accent text on dark.** The same
swatch cannot do both jobs.

| Use | Ratio | Verdict |
|---|---|---|
| `#ffa5ab` cotton-candy as text on light paper | **1.72:1** | ❌ Effectively invisible. Never |
| `#ffa5ab` as text on dark paper | **10.17:1** | ✅ AAA — this is the dark accent |
| `#a53860` berry as text on light paper | **5.80:1** | ✅ AA — this is the light accent |
| `#a53860` as text on dark paper | **3.02:1** | ❌ Too dark. Fails as dark text |
| `#a53860` as a fill with white text | **6.30:1** | ✅ AA — the accent pill |
| `#da627d` blush as text on light | **3.21:1** | ⚠️ Large text only, ≥24pt |

The accent **swaps swatch between themes.** Light uses berry; dark uses cotton-candy. Reusing one
across both produces either an invisible accent or a failing one.

### Light

| Token | Hex | Ratio on paper | Use |
|---|---|---|---|
| `--paper` | `#FDF4EC` | — | Soft-apricot, desaturated for full-screen |
| `--surface` | `#FFFFFF` | — | Cards |
| `--sunken` | `#F9DBBD` | — | Raw soft-apricot. Wells, XP track |
| `--ink` | `#450920` | **14.72:1** AAA | Display, body, **and the primary button fill** |
| `--ink-secondary` | `#6E4A52` | **6.99:1** AA | Supporting copy |
| `--ink-muted` | `#8A6069` | **4.88:1** AA | Metadata, placeholders. **Floor** |
| `--rule` | `#EEDCD3` | low | Decorative dividers only — see the border note |
| `--on-ink` | `#FDF4EC` | 14.72:1 on ink | Text on the ink button |
| `--accent` | `#A53860` | **5.80:1** AA | Berry-crush. Accent text and pill fill |
| `--on-accent` | `#FFFFFF` | **6.30:1** on accent | Text on the berry pill |
| `--accent-tint` | `#FFA5AB` | fill only | Cotton-candy. **Decorative fills, never text** |
| `--focus-ring` | `#450920` | — | 3px, always visible |
| `--destructive` | `#9D0208` | **7.90:1** AAA | 🚫 Destructive confirms ONLY. Borrowed — deliberately foreign to the palette, which is correct for the one irreversible action |

### Dark

Tonal, not inverted. Deepened bordeaux paper, apricot ink.

| Token | Hex | Ratio on paper | Use |
|---|---|---|---|
| `--paper` | `#24050F` | — | Bordeaux deepened from `#450920` |
| `--surface` | `#300714` | — | |
| `--sunken` | `#1A040B` | — | |
| `--ink` | `#F9DBBD` | **14.40:1** AAA | Soft-apricot. Display, body, **and the button fill** |
| `--ink-secondary` | `#D3AE99` | **9.32:1** AAA | |
| `--ink-muted` | `#A08578` | **5.55:1** AA | Floor |
| `--rule` | `#43121F` | low | Decorative only |
| `--on-ink` | `#24050F` | 14.40:1 on ink | Dark text on the apricot button |
| `--accent` | `#FFA5AB` | **10.17:1** AAA | Cotton-candy — **swaps from berry**, see the asymmetry |
| `--accent-alt` | `#DA627D` | **5.46:1** AA | Blush-rose, for a second accent weight |
| `--destructive` | `#E5736B` | **6.34:1** AA | 🚫 Destructive confirms ONLY |

### On borders — a correction to the v2 rule

v2 required every border to clear 3:1. That was too broad. **WCAG 1.4.11 applies to boundaries that
identify a control**, not to decorative dividers — a hairline between two list rows needs no ratio,
because the rows are identified by their text. Forcing 3:1 on a hairline against paper requires a
heavy mid-brown that damages the design for no accessibility gain.

- `--rule` — decorative separators. No ratio requirement.
- **Field boundaries use a 2px `--ink` underline**, not a light box outline. That is 16:1 and clears
  the requirement outright, which is why the design already sidesteps the problem.
- Any future control whose boundary is its only affordance must use `--ink` or `--ink-secondary`.

### Verification

Every ratio above was computed, not estimated, and is re-asserted by `pnpm test:a11y`
(quickstart V10) **per theme independently**. Light-mode values never carry to dark.

---

## 2. Typography

**Space Grotesk for display. System face for body and everything that scales.**

The hybrid is deliberate. Dynamic Type to XXL without clipping is constitutional (Principle VII,
FR-036), and custom fonts are the most common cause of clipping at accessibility sizes. So the
custom face is confined to large display text where clipping risk is low, and every size a person
can scale up is the system face. This is the exact revisit condition v1 left open.

| Role | Face | Size | Weight | Line height | Tracking |
|---|---|---|---|---|---|
| **Hero** | Space Grotesk | **44** | 700 | 1.0 | −0.02em |
| Display | Space Grotesk | 32 | 700 | 1.05 | −0.02em |
| Title | Space Grotesk | 24 | 700 | 1.15 | −0.01em |
| Field input | System | 22 | 400 | 1.3 | 0 |
| Emphasis | System | 17 | 600 | 1.45 | 0 |
| **Body** | System | **17** | 400 | 1.5 | 0 |
| Supporting | System | 15 | 400 | 1.5 | 0 |
| Meta | System | 13 | 400 | 1.4 | 0 |

Rules:
- **Sentence case and lowercase. Never ALL CAPS, never Title Case.** Caps read as shouting, which
  Principle XI forbids in tone as well as punctuation.
- **The one thing that matters is enormous.** One hero element per screen; everything else recedes.
  This is Strava's lesson and it is also Principle II — one action, unmistakably.
- Body is 17pt minimum. Nothing below 13pt.
- **Tabular figures** for every timer, count, and XP value.
- Hierarchy from size and weight — **never colour**, since there is only one colour and it is spoken for.
- Space Grotesk ships bundled. No network fetch, no FOIT, no layout shift.

---

## 3. Space, size, radius

Standard-spacious (density 4/10). Emptiness is the primary compositional tool.

```
--space-1:  4     --space-5: 24
--space-2:  8     --space-6: 32
--space-3: 12     --space-7: 48
--space-4: 16     --space-8: 72
                  --space-9: 112   ← above a solitary hero or primary action
```

| Token | Value | Note |
|---|---|---|
| `--radius-field` | 14 | Inputs, cards |
| `--radius-card` | 18 | |
| `--radius-pill` | 999 | **All primary buttons are full pills**, full-width |
| `--hairline` | 1 | |

Explicitly **not** brutalist 0px corners. Pills, per the references.

**Touch targets 48pt minimum**, 8pt gaps. Primary buttons are 56pt tall and full-bleed to the safe
gutter. Every screen wraps in `SafeAreaView`.

---

## 3b. iPad layout — the target is a tablet, not a phone

Added 2026-07-30 after the reference device was corrected. **Every mockup produced before this date
was phone-shaped and is wrong at full width.**

Reference: **iPad Air 4th gen** — 10.9″, 2360×1640px, **1180×820pt** @2x. No notch, no Dynamic
Island; home-indicator gesture bar present. Split View and Slide Over supported; **Stage Manager is
not** (M1+ only), so the app never needs to handle arbitrary free-form window sizes — only Apple's
fixed multitasking widths.

### Size classes the app must handle

| Class | Width | Where it comes from |
|---|---|---|
| `compact` | ~320pt | Slide Over |
| `narrow` | ~375pt | Split View ⅓ |
| `medium` | ~535–590pt | Split View ½ |
| `wide` | 820pt | Full screen, portrait |
| `widest` | 1180pt | Full screen, landscape |

**All four orientations are supported.** No orientation lock.

### The content column — the single most important iPad rule

> **Content never spans the full width.** A capture field 1180pt wide is unreadable, and a
> full-bleed pill button that wide reads as a mistake.

```
--content-max: 620pt        ← centred, with --space-7 (48) gutters minimum

  ┌──────────────────────────────────────────────────────────┐
  │            ┌────────────────────────────┐                │
  │            │  what's on your mind?      │                │
  │            │  ────────────────────────  │   ≤620pt       │
  │            │  ▓▓▓▓▓▓ hold it ▓▓▓▓▓▓     │                │
  │            └────────────────────────────┘                │
  │                     1180pt                                │
  └──────────────────────────────────────────────────────────┘
```

- Below 620pt the column is simply the screen minus gutters — so `compact` and `narrow` behave
  exactly like a phone, which is why one layout serves all five classes.
- The **pill button is full-width *of the column*, never of the screen.**
- Line length stays 35–60 characters at every class, which the column enforces automatically.

### Type at tablet scale

The hero does **not** scale linearly with width. The column already gives it presence.

| Class | Hero | Field input |
|---|---|---|
| `compact` / `narrow` | 36pt | 20pt |
| `medium` | 44pt | 22pt |
| `wide` / `widest` | 52pt | 24pt |

Space Grotesk stays ≥24pt-only. The system face still carries everything that scales with
Dynamic Type.

### Hardware keyboard

The Magic Keyboard and Smart Keyboard Folio are the likely daily configuration for a capture app on
this device, so keyboard operation is a first-class path, not an afterthought.

- Capture field is focused on launch — typing works with **zero taps**.
- `Return` commits and keeps focus. `Shift+Return` inserts a newline.
- `Escape` clears the field without leaving the screen.
- Full keyboard navigation for every control; focus ring always visible (`--focus-ring`, 3px).
- Pointer/trackpad hover states are permitted but must never be the *only* affordance.

### Multitasking behaviour

- Layout must reflow on split-width change **without losing draft text** (FR-006 applies to
  resize, not only to backgrounding).
- No horizontal scrolling at any class.
- Safe-area insets respected in every orientation, including the gesture bar in landscape.

### What this does not change

The one-card principle, the single pill, and the emptiness are unchanged — a wider screen means
*more whitespace around one action*, never more actions on screen. Filling the extra width with a
second column would violate Principle II.

## 4. Motion

```
--motion-instant:  0ms      ← Reduce Motion resolves EVERY token to this
--motion-micro:  150ms
--motion-enter:  200ms
--motion-exit:   120ms      ← ~60% of enter
--ease-enter: ease-out   --ease-exit: ease-in
```

- **`Reduce Motion` → 0ms on every token.** Not reduced. Zero. Constitutional.
- Reanimated 3 / Moti only. **No GSAP, no Framer Motion** — DOM-based, will not run here.
- `transform` and `opacity` only. Never width, height, or layout position.
- One or two elements in motion per view, maximum. Press feedback is opacity, never scale-and-shift.
- Bold type does **not** license bold motion. The type is loud so the motion doesn't have to be.

---

## 5. Iconography

- **Phosphor** (`@phosphor-icons/react-native`), **bold** weight to sit with the display face.
- **No emoji as icons, ever.**
- Tokens only: `icon-sm 18` · `icon-md 24` · `icon-lg 32`.
- One family, one stroke weight per layer. Outline and filled never mix at the same level.
- Every icon-only control carries an `accessibilityLabel`.

---

## 6. Components

### The one card (FR-1.3)
The action title in **Hero (44pt)**. Below it, three affordances: **do it** as a full-width ink pill,
**not now** and **something else** as plain text buttons. One pill per screen, ever.

### Capture field (FR-002)
Input text at 22pt — you can read what you typed at a glance. Focused on first paint. No spinner, no
disabled state, no character counter. Placeholder is not a label.

### Companion — a crow
Watchful, unsentimental; a crow noticing your patterns reads as intelligence rather than devotion,
which is the "shadow teacher" posture. It also cannot plausibly be depicted as neglected — a
constraint the design needs (Principle IV), not a coincidence.

Drawn as a flat silhouette in `--ink`. States: `idle` · `attentive` · `acknowledging` — **and nothing
else.** No sad, sick, hungry, or neglected state exists in the asset set. Never drawn in
`--attention` or `--destructive`.

### Theme
**Follows the system.** No theme question at onboarding (Principle V). Override in Settings.

### Counts and empty states
Counts in `--ink-muted`, never a badge, never amber. Empty reads as sufficiency —
*"nothing needs you right now"*, never *"0 items"*.

### Game layer — visible, and monotonic
Owner decision, 2026-07-30, against recommendation. Ships in the one shape compatible with
Principle IV.

> **Numbers that only rise may be visible. Numbers that can fall may not.**

| Permitted on the main surface | Why safe |
|---|---|
| XP total, level | Monotonic — cannot decrease, so can never report a loss |
| Progress to next level as a **filling** track | Accumulation, not deficit |
| Reveal on completion | Bounded, always positive, no null or negative outcome (FR-0.7) |

| Forbidden regardless | Principle |
|---|---|
| XP loss, decay, expiry; level-down | IV |
| HP, hearts, depleting energy | IV — named in research as an anxiety trigger |
| "40 XP to go" phrased as shortfall | IV — same fact, deficit framing |
| Streak prominence rising with length | IV (FR-0.7a) — **streaks are exempt from this decision.** A streak can break, so it still fades past 30 days |
| Leaderboards, ranks, comparison | IV |
| Any total of things not done | IV (FR-031) |

XP renders in `--ink` and `--surface-sunken`. **Never amber, never red.** The track fills; it never
drains. The companion never narrates XP — it is not a scorekeeper (Principle XI).

### Destructive confirm
The only surface permitted `--destructive`, and it uses it on an **outlined** button, never a filled
one. Visually separated from ordinary actions. Offers undo wherever the operation allows.

---

## 7. Anti-patterns — build failures, not preferences

| Never | Because |
|---|---|
| Red for overdue, error, warning, validation | Principle IV. Amber is the ceiling |
| ALL CAPS display or button text | Reads as shouting (Principle XI) |
| A second chromatic colour | Amber's signal power depends on being alone |
| More than one pill button per screen | Principle II — one action |
| A streak number growing more prominent | Streak anxiety scales with length (FR-0.7a) |
| Any figure aggregating things not done | Principle IV (FR-031) |
| A companion state conveying neglect | Principle IV / XI (FR-021) |
| Emoji as a structural icon | Untokenizable, platform-inconsistent |
| GSAP, Framer Motion, shadcn, Radix | Web-only. No DOM in React Native |
| Animation ignoring Reduce Motion | Principle VII, CRITICAL |
| Space Grotesk below 24pt | Dynamic Type clipping risk — system face below that |
| Hardcoded hex in a component | Semantic tokens only |
| A count on the home-screen widget | Most visible surface the person owns (FR-031) |
