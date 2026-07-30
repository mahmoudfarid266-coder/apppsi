# Rudder — Project Context & Toolchain

**This file is the handoff document.** It is self-contained: paste it into a fresh chat and that
session has everything it needs to plan and build without re-deriving decisions.

Claude Code auto-loads this file in any session opened in this repo.

---

## 1. What we're building

**Rudder** (working title — verify availability in App Store Connect before it reaches a bundle ID)
is an ADHD executive-function app for iPad and iPhone.

It is **not** a to-do app with a purple gradient. It targets six mechanical failure modes:
working-memory collapse, task-initiation paralysis, time blindness, decision fatigue, the
shame-spiral that causes app abandonment, and the interoception gap around medication and energy.

It is **not** a medical device. No diagnosis, no dosing, no efficacy claims. Ever.

### Locked decisions

| Decision | Value | Why |
|---|---|---|
| **Audience** | Personal tool first, App Store later | Dogfood daily; harden for public release after |
| **Scope** | Seven systems, one loop, one companion | See `VISION.md`. The old "four pillars" are a subset |
| **Client** | Expo (React Native) + TypeScript | **The developer is on Windows 11.** See §2 |
| **Backend** | Supabase | Real Postgres + Auth + RLS + Realtime + Edge Functions |
| **Local data** | SQLite = source of truth for the UI | Offline-first is a hard requirement, not a nice-to-have |
| **Distribution** | TestFlight via EAS cloud builds | Beats sideloading once the $99 is paid |
| **Unavoidable cost** | $99/yr Apple Developer Program | Everything else runs on free tiers |

### The four pillars

| | Pillar | Solves |
|---|---|---|
| **P1** | Capture & Executive Function | Working memory, task initiation, decision fatigue |
| **P2** | Time Blindness Tools | Time blindness, lateness, transition failure |
| **P3** | Focus Sessions & Body Doubling | Sustained attention, distraction leakage |
| **P4** | Medication & Mood/Energy Log | Interoception gap, prescriber conversations |

---

## 2. The constraint that drives the stack

**The developer's machine is Windows 11. Apple only allows iOS apps to be compiled on macOS.**

That is a toolchain fact, not a preference — `xcodebuild`, the iOS SDK, and code signing exist only
on macOS. Three ways out:

1. Buy a Mac — rejected, ~$600
2. **Rent macOS per build in the cloud** — Expo EAS Build and GitHub Actions macOS runners. ✅ chosen
3. Hourly cloud Mac rental — expensive, only for deep native debugging

**Consequence: native SwiftUI and Flutter are effectively off the table.** Expo is cloud-build-first
by design, which is why it wins here. You push from PowerShell, a Mac in a data centre compiles,
you get an `.ipa` back. You never open Xcode.

**The one leak:** Live Activities and Home Screen widgets need a small Swift/WidgetKit extension
(~200 lines). You write it in VS Code on Windows; EAS compiles it. Deferred to v1.1 — not a v1
blocker.

---

## 3. Tech stack

### Client

| Concern | Package | Notes |
|---|---|---|
| Framework | `expo` (SDK 52+) + TypeScript | Cloud builds, no Mac needed |
| Navigation | `expo-router` | File-based, typed, handles deep links + App Intents |
| Styling | `nativewind` v4 | Tailwind syntax in React Native |
| Local DB | `expo-sqlite` + `drizzle-orm` | **UI source of truth.** WAL mode |
| Server state | `@tanstack/react-query` v5 | Cache, retry, offline mutation persistence |
| UI state | `zustand` | Timer/session state that must not re-render the tree |
| Animation | `react-native-reanimated` v3 | Runs on the UI thread — the visual timer needs this |
| Animation API sugar | `moti` | Framer-Motion-style declarative API, compiles to Reanimated |
| Gestures | `react-native-gesture-handler` | |
| Canvas / charts | `@shopify/react-native-skia`, `victory-native` | Radial timer arc, P4 correlation views |
| Forms | `react-hook-form` + `zod` | Zod schemas shared with Edge Functions |
| Dates | `date-fns` + `@date-fns/tz` | Med schedules across timezones — don't hand-roll |
| Notifications | `expo-notifications` | Local for timers (must fire offline), push for digests |
| Background | `expo-background-task` | Sync + reminder rescheduling |
| Speech | `expo-speech-recognition` | On-device voice capture |
| Calendar | `expo-calendar` | Read-only in v1 |
| Errors | `@sentry/react-native` | With mandatory PII scrubbing — see §5 |
| Analytics | PostHog (EU region) | Event names only, never content |
| Payments (post-v1) | RevenueCat + StoreKit 2 | Free until ~$2.5k/mo revenue |

### Backend — Supabase

| Piece | Used for |
|---|---|
| Postgres | Every table. Real relational schema — this is not a document-store problem |
| Auth (GoTrue) | Sign in with Apple, email magic link, anonymous users |
| RLS | **The authorization layer.** `user_id = auth.uid()` on every table. No API server to bypass |
| PostgREST | Auto-generated CRUD — almost no backend code to write |
| Realtime | Body-doubling presence, cross-device live updates |
| Edge Functions (Deno) | AI triage/decompose (protects the API key), push scheduling, PDF export |
| Storage | Voice-note audio |
| `pg_cron` + `pg_net` | Nightly digests, med-log pre-generation, batch triage |

### AI

API key **never** in the client — all calls go through an Edge Function.

| Job | Model | Cost (1 user) |
|---|---|---|
| Capture triage | `claude-haiku-4-5`, batched 20/call | < $0.50/mo |
| Task decomposition | `claude-sonnet-5` | ~$1.50/mo |
| Weekly review | `claude-haiku-4-5` | < $0.05/mo |

Batching + prompt caching keep this ~10× cheaper than per-capture calls. Hard per-user daily spend
cap enforced server-side against an `ai_runs` ledger. **The app must work fully with AI disabled.**

### The sync model (the interesting part)

**SQLite is the source of truth for the UI. Supabase is the source of truth for the account.**

- Every row: client-generated `uuidv7` id, server-stamped `updated_at`, `deleted_at` tombstone,
  monotonic `rev` from a Postgres sequence
- **Write:** UI mutation → SQLite → local `outbox` table → return. Done. No network on the path
- **Read:** pull by cursor (`where rev > :cursor`). Realtime just pokes the puller — an
  optimization, never a correctness requirement
- **Conflicts:** last-writer-wins per row, with two exceptions: **captures are append-only and
  never merged** (losing one breaks trust in the whole product), and **counters are event rows
  that get summed**, never mutable integers
- Hand-rolled, ~400 LOC. The schema shape is deliberately what PowerSync expects, so swapping it
  in later is a contained change

### Free-tier reality

| Service | Free tier | Verified |
|---|---|---|
| Supabase | 500MB DB, 50k MAU, 500k function calls, 2 projects | 2026-07-27 |
| Expo EAS | 15 iOS builds/mo, **unlimited free push** | 2026-07-27 |
| Cloudflare Pages | Marketing site + privacy policy | — |
| Resend | ~3k emails/mo | — |
| Sentry / PostHog / RevenueCat / Figma / UptimeRobot | Ample for solo | — |

**Two gotchas that each cost an evening:** free Supabase projects **pause after ~1 week idle**
(mitigate with an UptimeRobot ping), and **auth emails are rate-limited to a trickle** — wire
Resend SMTP on day one or magic links will look broken.

Realistic all-in: **~$120/year.**

---

## 4. Non-negotiable design principles

Ratified as `.specify/memory/constitution.md` **v2.0.0** (amended 2026-07-29). Eight are marked
NON-NEGOTIABLE. These are gates that block a plan, not aspirations. **`VISION.md` is the current
narrative source** — `docs/00-overview.md` and `docs/01-prd.md` are stale against v2.0.0.

| | Principle | Enforced as |
|---|---|---|
| I | **Capture Is Sacred** 🔒 | <2s launch-to-typing, <50ms local write, zero required fields, never lost to a conflict |
| II | One Next Action | Home shows exactly one task. Backlog never surfaced by default, never sorted oldest-first |
| III | Time Is Visual | Draining disc primary, numbers subordinate. Timer restores from wall-clock |
| IV | **No Punishment Mechanics** 🔒 | **No red anywhere** except destructive confirms. Streaks pause, never break. Re-entry flow after 72h |
| V | The App Decides, User Vetoes | Every screen completable by accepting defaults alone |
| VI | **Offline-First** 🔒 | Every P0 feature works in airplane mode, indefinitely |
| VII | Low-Stim By Default | Reduce Motion → 0ms. WCAG 2.2 AA. 48pt targets. Dynamic Type to XXL |
| VIII | **AI Is Optional** 🔒 | Fully usable with AI off. Failure degrades, never errors |
| IX | Pure Domain Logic Is Test-First | `src/domain/` is pure TS, no React, no I/O, TDD'd |
| X | **Stakes Are Contracts, Not Punishments** 🔒 | Ten conjunctive conditions. Never on health behaviours. Sensors propose, humans confirm. Auto-suspend under load |
| XI | **The Companion Is Not A Creditor** 🔒 | Companion never mentions money, never shames, narrates patterns not incidents. Ledger is a separate cold surface |
| XII | **Location Is Sensitive By Default** 🔒 | Precise location never leaves the device. No real-time position or history to other users, ever. Block+report ship day one |
| XIII | Enforcement Is Friction, Never Lockout | Nothing blocks. Declining costs ~15s of deliberate interaction, is never counted, never guilt-tripped |

Plus hard security rules: RLS on every table with a **CI test proving cross-user isolation**; the
Anthropic key and `service_role` key never reach the client; **PHI never written to iCloud**
(App Store Guideline 5.1.3); no SDK ever receives task titles, capture text, medication names, or
check-in values.

**The no-red rule is a product decision, not aesthetic.** Red signals failure, and failure signals
are what drive ADHD app abandonment.

---

## 5. Installed toolchain — 49 skills

All installed **project-scoped** in `.claude/skills/` and committed to git. They travel with the
repo. A different project needs its own install.

### 5.1 Spec Kit — the process (10 skills)

From [github/spec-kit](https://github.com/github/spec-kit), installed via
`specify init --here --integration claude --script ps`. Also scaffolded `.specify/`
(PowerShell scripts, templates, constitution).

**The core loop — type these as messages:**

| Order | Command | Produces |
|---|---|---|
| 1 | `/speckit-constitution` | `.specify/memory/constitution.md` — ✅ **already done, v1.0.0** |
| 2 | `/speckit-specify <description>` | `specs/NNN-name/spec.md` |
| 3 | `/speckit-clarify` | Asks ≤5 targeted questions, writes answers back into the spec |
| 4 | `/speckit-plan` | `plan.md`, `research.md`, `data-model.md`, `contracts/` + runs the Constitution Check |
| 5 | `/speckit-tasks` | `tasks.md`, dependency-ordered |
| 6 | `/speckit-implement` | Actual code |

Optional: `/speckit-analyze` (cross-artifact consistency, after `tasks`), `/speckit-checklist`
(quality checklist, after `plan`), `/speckit-taskstoissues` (GitHub issues), `/speckit-converge`
(audits built-vs-spec and appends the gap as new tasks — use when you've drifted).

**Three things that will bite you:**

- **Don't skip `/speckit-clarify`.** It's marked optional and it's the highest-value step.
  Ambiguity surviving into `plan.md` becomes wrong code in `implement`.
- **A spec may not contain implementation details.** No frameworks, no APIs, no "SQLite". Those
  belong in `plan.md`. If you feed tech names into `/speckit-specify` it will correctly translate
  them into user-observable outcomes.
- **`/speckit-implement` runs the entire `tasks.md`.** Read the task list first, then implement in
  batches — or use `subagent-driven-development` for a review gate between each task.

**Note:** this version does **not** create git branches. It creates `specs/NNN-name/` and records
the active feature in `.specify/feature.json`.

`plan-template.md` has been customised with an **18-row Constitution Check table** plus a **Gate 0**
(name the loop stage and system this feature occupies), derived from §4, so every `/speckit-plan`
run is gated against all thirteen principles plus the security, money, and workflow rules.

### 5.2 Superpowers — engineering discipline (~30 skills)

From [obra/superpowers-skills](https://github.com/obra/superpowers-skills). **These auto-trigger on
what you describe — you don't invoke them.**

| Say this | This fires |
|---|---|
| "build the capture bar" | `test-driven-development-tdd` — will insist on RED-GREEN-REFACTOR |
| "the sync test is flaky" | `condition-based-waiting` + `systematic-debugging` |
| "this bug is deep in the stack" | `root-cause-tracing` |
| "I'm stuck" | `when-stuck-problem-solving-dispatch` routes to the right technique |
| "before I merge this" | `requesting-code-review` |
| "am I done?" | `verification-before-completion` — runs commands, won't take your word |

Worth invoking deliberately: `/brainstorming-ideas-into-designs` (Socratic refinement before
speccing something fuzzy), `/writing-plans`, `/subagent-driven-development`,
`/using-git-worktrees`.

Thinking tools for when you're stuck: `inversion-exercise`, `scale-game`,
`simplification-cascades`, `collision-zone-thinking`, `meta-pattern-recognition`,
`tracing-knowledge-lineages`, `preserving-productive-tensions`.

Testing discipline: `testing-anti-patterns` (never test mock behaviour, never add test-only methods
to production classes), `defense-in-depth-validation`.

### 5.3 Design (9 skills)

| Skill | Use for | Caveat |
|---|---|---|
| `ui-ux-pro-max` | Design system generation. 67 styles, 161 palettes, 57 font pairings, 21 stacks **including React Native** | **Override its palette AND its style pick.** It doesn't know the no-red rule, and it emits GSAP (web-only). See `design-system/MASTER.md` §0 for what was rejected and why — don't restore it |
| `mobile-app-ui-design` | Mobile screens, flows, onboarding, navigation. Patterns from Airbnb/Duolingo/Spotify | Best fit for this project |
| `framer-motion` | Motion/Framer Motion animation guidance | ⚠️ **WEB ONLY — see below** |
| `ui-styling` | shadcn/ui + Radix + Tailwind | ⚠️ **WEB ONLY** — Radix renders DOM |
| `design`, `design-system`, `brand`, `banner-design`, `slides` | Logos, tokens, brand identity, presentations | Bundled with the `uipro` install |

**⚠️ The web/native split — this matters.**

Framer Motion (now `motion`) and shadcn/Radix animate and render **DOM elements**. React Native has
no DOM. **They will not work in the Rudder app.**

- **In the app:** `react-native-reanimated` + `moti`. Moti gives you the same declarative
  `animate={{ }}` API, compiled to Reanimated.
- **Where the web skills apply:** the marketing site (Cloudflare Pages) and the future web
  dashboard for P4 trends. Those are real React projects.

Same reason **21st.dev / Magic MCP is deliberately not installed** — it emits shadcn/Radix, so its
output can't be dropped into the app. Add it if/when the marketing site is built.

### 5.4 MCP servers — `.mcp.json`

| Server | Status | Use |
|---|---|---|
| **Mobbin** | ✅ connected | `search_screens`, `search_flows`, `search_sections`. 620k+ real shipped screens, iOS + web, deep AI search. **Returns references, not code — framework-agnostic, so it works for React Native.** Requires a paid Mobbin account |
| **Context7** | ✅ connected, no auth | Version-accurate docs for Expo/Reanimated/Drizzle/Supabase. These move fast enough that stale training data produces broken code |
| **Figma** | available in some environments | Code↔design both directions; `generate_diagram` renders the ERD into FigJam |
| **Supabase MCP** | not yet added | Add read-only once a project exists: `claude mcp add --transport http supabase https://mcp.supabase.com/mcp` |

Mobbin usage: `search_screens({ query: "focus timer screen with circular countdown", platform: "ios" })`.
Be specific and describe one screen at a time — vague style words and keyword lists score badly.

### 5.5 Deliberately skipped

| Tool | Why |
|---|---|
| **SuperClaude Framework** | Heavily overlaps Superpowers. Running both means two systems telling Claude how to work. Aimed at large teams; weight you pay on every prompt |
| **Nexus** | Ambiguous — four unrelated projects share the name. Needs disambiguation before evaluating |
| **21st.dev** | Web-only output (see §5.3) |

**Don't install more agent frameworks.** They inject competing instructions and each consumes
context window. Spec Kit owns the process; Superpowers owns the discipline. That's enough.

---

## 6. Repo layout

```
C:\Users\mahmo\Downloads\iti\      ← active working tree (carried over from C:\Users\mahmo\app)
├── CLAUDE.md                      ← this file
├── VISION.md                      ← the current narrative source of truth
├── README.md                      index + start-here commands
├── docs/                          the full spec set (see §7) — 00 and 01 STALE vs constitution v2.0.0
├── .specify/
│   ├── memory/constitution.md     v1.0.0, ratified — the governing document
│   ├── templates/                 plan-template.md carries the 12-gate check
│   ├── scripts/powershell/
│   └── feature.json               tracks the active feature
├── .claude/skills/                49 skills
├── .mcp.json                      Mobbin + Context7
├── .gitattributes                 LF normalization — CRLF breaks EAS macOS builds
└── specs/                         per-feature specs (see §8)
```

### Planned app structure (from `docs/02-architecture.md`)

```
app/            expo-router routes: (tabs)/now · focus · log · backlog
src/
  db/           drizzle schema, migrations, queries
  sync/         outbox, puller, cursor, conflict rules
  domain/       ← PURE TypeScript. No React, no I/O. TDD'd. The product lives here
  features/     one folder per pillar
  ui/           design system primitives
supabase/       migrations, edge functions, seed
ios/RudderWidgets/  Swift widget extension (v1.1)
```

`src/domain/` holds the Next Action scorer, calibration factor, streak-repair rules, day-capacity
calculation, and adherence computation. **Pure, no simulator needed, 100% unit-testable.** That is
where the product's actual behaviour lives and where testing effort should concentrate.

---

## 7. The spec documents

| Doc | Contents |
|---|---|
| `docs/00-overview.md` | Problem, the ten design principles, scope |
| `docs/01-prd.md` | ~40 numbered requirements with acceptance criteria, explicit non-goals |
| `docs/02-architecture.md` | Stack comparison, system diagram, sync model, AI integration |
| `docs/03-data-model.md` | Mermaid ERD (24 entities), Postgres DDL, RLS pattern, local SQLite deltas |
| `docs/04-wireframes.md` | Navigation map, 27 screens, wireframes, design tokens |
| `docs/05-toolchain.md` | Full research on every skill/MCP evaluated, with verdicts |
| `docs/06-shipping.md` | Windows → App Store, TestFlight, SideStore, App Review health rules |
| `docs/07-roadmap.md` | 20-week phased plan with Gantt critical path |
| `docs/08-free-tier-stack.md` | Zero-cost stack, verified limits, where each wall is |

**Point Spec Kit at these.** They are the input; Spec Kit turns them into executable specs. Don't
re-describe the product from scratch each time.

---

## 8. Current state

**Done:**
- All nine spec documents written (00 and 01 now stale — see below)
- `VISION.md` written 2026-07-29: brain dump → one loop, seven systems, one companion
- **Constitution amended to v2.0.0** — adds Principles X (stakes as contracts), XI (companion not a
  creditor), XII (location sensitive by default), XIII (friction not lockout); Principles II and IV
  materially amended; security section extended to curriculum, contacts, location, and money
- `plan-template.md` gates rebuilt: Gate 0 + 18 rows
- 49 skills installed; Mobbin + Context7 MCP connected

**Not done:**
- **No code exists.** No Expo project scaffolded, no Supabase project created
- **`docs/00-overview.md` and `docs/01-prd.md` must be rewritten from `VISION.md`** — they still
  describe four pillars and constitution v1.0.0
- Apple Developer Program not enrolled — **24–48h+ approval, gates TestFlight, start it early**
- App name not verified in App Store Connect. Name itself is undecided (`VISION.md` §9 D5)
- Git not yet initialized in this working tree

**Delete before the next specify run:** `specs/001-capture-sync/` was not carried over from the old
tree. It was written against v1.0.0, has three unresolved clarifications, and predates the
companion. Re-spec from `VISION.md` instead.

**Owner decisions recorded 2026-07-29:** stakes = contract model with Principle X's ten guardrails
(not pure forfeit, not social-only); enforcement = friction; social systems gated behind
daily-driver status.

### Roadmap shape

| Phase | Weeks | Output |
|---|---|---|
| 0 | 1 | Foundations, Apple enrollment, design tokens |
| 1 | 2–3 | Capture + sync engine → **start dogfooding** |
| 2 | 4–6 | Now screen, visual timer, notifications → **TestFlight, daily driver** |
| 3 | 7–8 | AI decomposition |
| 4 | 9–11 | Focus sessions |
| 5 | 12–13 | Calendar + time-to-leave |
| 6 | 14–16 | Meds + mood *(last — triggers App Review health scrutiny)* |
| 7 | 17–20 | Polish, accessibility, submission |

**The single most important rule:** don't start phase N+1 until the phase N build has been in real
daily use for a week. Scope creep across four pillars is the identified primary risk. An ADHD app
you don't use is an expensive way to procrastinate.

---

## 9. Working agreements

- **Windows/PowerShell.** `&&` doesn't chain — use `;` or `if ($?) { }`. Prefer the Bash tool for
  POSIX scripts.
- **LF line endings everywhere** except `.ps1`/`.bat`/`.cmd`. EAS runners are case- and
  ending-sensitive; `import './button'` works locally and breaks in CI.
- **Never commit secrets.** `.env.local` gitignored → EAS Secrets for builds → Supabase Function
  secrets for server.
- **Verify before claiming done.** `verification-before-completion` exists for this; run the
  command and show the output.
- **Flag principle conflicts rather than resolving them silently.** If a feature request violates
  §4, say so before building it.
