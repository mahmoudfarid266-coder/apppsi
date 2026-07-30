# Rudder — System Architecture & Tech Stack

---

## 1. The constraint that decides everything

**You are on Windows 11. Apple only allows iOS apps to be *compiled* on macOS.**

That is a hard technical fact — it's not a licensing preference, the toolchain (`xcodebuild`, the
iOS SDK, code signing) only exists on macOS. So there are exactly three ways to get an iOS build:

1. Own/rent a Mac — you don't, and a Mac mini is ~$600.
2. **Rent macOS in the cloud, per build** — this is what Expo EAS Build and GitHub Actions macOS
   runners do. You push code from Windows, a Mac in a data centre compiles it, you get an `.ipa`
   back. **This is the path.**
3. Cloud Mac rental by the hour (MacStadium, MacinCloud) — expensive, only needed for deep native
   debugging.

Option 2 means **you never touch a Mac** — but it also means you should pick a framework whose
official tooling is built around cloud builds. That is Expo.

## 2. Tech stack options, compared honestly

| | **Expo / React Native** | **Flutter** | **Native SwiftUI** | **Capacitor / PWA** |
|---|---|---|---|---|
| Language | TypeScript | Dart | Swift | TypeScript |
| Can you build from Windows? | ✅ Yes — EAS Build is cloud-first and designed for it | ⚠️ Only via third-party CI you wire yourself (Codemagic/GH Actions) | ❌ Effectively no | ✅ Yes, but still needs a Mac/CI to package |
| iPad-quality UI | ✅ Real native views | ⚠️ Custom-rendered — good, but never quite iOS-native | ✅ Perfect | ❌ Feels like a website |
| Widgets / Live Activities / Dynamic Island | ⚠️ Needs a small Swift widget target (see §7) | ⚠️ Same | ✅ First-class | ❌ Impossible |
| Notifications, background tasks | ✅ Mature (`expo-notifications`, `expo-background-task`) | ✅ Good | ✅ Best | ❌ Crippled on iOS |
| Offline SQLite | ✅ `expo-sqlite` + Drizzle | ✅ `drift` | ✅ SwiftData | ⚠️ IndexedDB |
| Supabase support | ✅ Official JS SDK, best-supported client | ✅ Official Dart SDK | ✅ Official Swift SDK | ✅ Same as RN |
| Android later | ✅ Free | ✅ Free | ❌ Full rewrite | ✅ Free |
| Talent/AI assistance | ✅ Largest corpus — Claude writes RN/TS extremely well | ⚠️ Good | ✅ Good | ✅ Good |
| Hiring/community for ADHD-app-shaped problems | ✅ Huge | ✅ Large | ✅ Large | ⚠️ Small |

### Recommendation: **Expo (React Native) + TypeScript**

Reasons, ranked:
1. **It removes the Mac problem entirely.** `eas build --platform ios` from PowerShell → `.ipa`.
2. **It's the only option where "personal tool → App Store product → Android" is one codebase.**
3. Supabase's JS SDK is its flagship client; you'll hit the fewest sharp edges.
4. Claude Code produces higher-quality React Native/TypeScript than Dart or Swift, which matters a
   lot when you're a solo dev leaning on AI.

**The one real cost:** Live Activities and widgets require a small native iOS extension written in
Swift/SwiftUI. That's ~200 lines in a config plugin, compiled on EAS's Macs — you write the Swift
in VS Code on Windows and never run Xcode. It's the single place the abstraction leaks, and it's
manageable. See §7.

## 3. The backend: Supabase — what it actually is

Supabase is a hosted bundle of open-source pieces around a **real PostgreSQL database**. You are
not adopting a proprietary datastore; you're adopting Postgres with batteries.

| Supabase piece | What it is | What Rudder uses it for |
|---|---|---|
| **Postgres** | A normal Postgres 15+ database you have full SQL access to | Every table in [03-data-model.md](03-data-model.md) |
| **Auth (GoTrue)** | User accounts, JWT issuance, OAuth providers | Sign in with Apple, email magic link, anonymous users |
| **RLS (Row Level Security)** | Postgres-native per-row access rules | Every table is `user_id = auth.uid()`. This *is* the authorization layer — there is no API server to bypass |
| **PostgREST** | Auto-generated REST API over your schema | The app's CRUD — no backend code to write |
| **Realtime** | Postgres logical replication → WebSockets | Body-doubling presence, cross-device live updates |
| **Edge Functions** | Deno serverless functions | AI triage/decomposition (protects the API key), push scheduling, PDF export |
| **Storage** | S3-compatible object store | Voice-note audio |
| **`pg_cron` + `pg_net`** | In-database scheduler | Nightly digests, med-reminder scheduling, AI batch triage |

**Why it's the right call here:** you get a genuine relational schema (which an app with tasks,
sessions, meds, and check-ins genuinely needs — this is not a document-store problem), you write
almost no backend code, and RLS means security lives in the database rather than in code you'd have
to get right yourself.

**The one thing to design around:** Supabase is online-first by default. Rudder is offline-first by
requirement (NFR-3). §5 solves that.

## 4. Full stack

```
┌──────────────────────── iPad / iPhone ───────────────────────────┐
│                                                                  │
│  Expo (React Native) + TypeScript                                │
│  ├── expo-router            file-based navigation                │
│  ├── Zustand                ephemeral UI state (timers, session) │
│  ├── TanStack Query         server state, cache, retries         │
│  ├── Drizzle ORM            typed queries                        │
│  ├── expo-sqlite (WAL)      ← SOURCE OF TRUTH FOR THE UI         │
│  ├── Reanimated 3           the visual timer, 60fps, UI thread   │
│  ├── Nativewind v4          Tailwind-syntax styling              │
│  ├── expo-notifications     local (timers) + push (digests)      │
│  ├── expo-background-task   sync + reminder rescheduling         │
│  └── Swift widget extension Live Activity, Home widgets  ←native │
│                                                                  │
│         ▲ instant local reads/writes          ▼ outbox           │
│  ┌──────┴──────────────────────────────────────────┐             │
│  │  SyncEngine  (pull-by-cursor + push-outbox)     │             │
│  └──────┬──────────────────────────────────────────┘             │
└─────────┼────────────────────────────────────────────────────────┘
          │ HTTPS / WSS
┌─────────▼──────────────── Supabase ──────────────────────────────┐
│  Auth (Apple, magic link, anon)                                  │
│  Postgres + RLS  ── all tables, all policies                     │
│  Realtime        ── presence for body doubling                   │
│  Storage         ── voice notes                                  │
│  Edge Functions (Deno)                                           │
│    ├── /triage        batch-classify captures                    │
│    ├── /decompose     break a task into first-physical-actions   │
│    ├── /schedule-push compute + enqueue notifications            │
│    └── /export        prescriber PDF / full data export          │
│  pg_cron         ── nightly jobs                                 │
└─────────┬────────────────────────────────────────────────────────┘
          │
   ┌──────▼───────┐   ┌──────────────┐   ┌──────────────┐
   │ Anthropic    │   │ Expo Push    │   │ Sentry       │
   │ Claude API   │   │ → APNs       │   │ PostHog      │
   └──────────────┘   └──────────────┘   └──────────────┘
```

### Package choices

| Concern | Choice | Why |
|---|---|---|
| Navigation | `expo-router` | File-based, typed, handles deep links + App Intents |
| Styling | `nativewind` v4 | Tailwind classes; fastest iteration, and the design tokens map cleanly |
| Local DB | `expo-sqlite` + `drizzle-orm` | Typed SQL, migrations, works in Expo Go and dev builds |
| Server state | `@tanstack/react-query` v5 | Cache, retry, optimistic updates, offline mutation persistence |
| UI state | `zustand` | Timer/session state that must not re-render the tree |
| Animation | `react-native-reanimated` v3 | The visual timer runs on the UI thread — no JS-thread jank |
| Charts | `victory-native` (Skia) | Correlation views (FR-7.5) |
| Geofencing | `expo-location` region monitoring | OS-managed, cheap, fires offline. **Not** continuous positioning — see §8.1 |
| Maps | `react-native-maps` with on-device annotation | Tile provider never receives quest data. FR-9.2 |
| Forms | `react-hook-form` + `zod` | Zod schemas shared with Edge Functions |
| Dates | `date-fns` + `@date-fns/tz` | Timezone handling for med schedules is genuinely hard; don't hand-roll |
| Payments (post-v1) | RevenueCat + StoreKit 2 | Subscription infra you should not build |
| Errors | `@sentry/react-native` | Scrubbed — see NFR-9 |
| Analytics | PostHog, self-hosted or EU cloud | Event names only, never content |

## 5. The sync model (the interesting part)

Rudder must be instant and offline (NFR-2, NFR-3), but Supabase is online-first. Resolution:

**SQLite is the source of truth for the UI. Supabase is the source of truth for the account.**

Every table carries:
- `id uuid` — generated **client-side** (`uuidv7`, time-ordered → good index locality)
- `updated_at timestamptz` — server-stamped on write
- `deleted_at timestamptz` — soft delete; hard purge after 30 days by `pg_cron`
- `rev bigint` — monotonic per-row revision from a Postgres sequence

**Write path:** UI mutation → write SQLite → append to local `outbox` table → return. UI is done.
A background worker drains the outbox with `upsert` calls, retrying with exponential backoff.

**Read path:** pull changes since a stored cursor —
`select * from <table> where updated_at > :cursor order by updated_at limit 500`, loop until drained.
Realtime subscriptions just poke the puller; they are an optimization, never a correctness
requirement.

**Conflict resolution:** last-writer-wins per row on `updated_at`, with two exceptions:
- **Captures are append-only and never merged.** A capture can never be lost to a conflict. This is
  the one place where losing data would break the user's trust in the whole product.
- **Counters** (focus minutes, XP) are stored as event rows and summed, never as mutable integers.

**Why hand-rolled and not PowerSync/ElectricSQL/WatermelonDB:**
- PowerSync + Supabase is genuinely excellent and is the right answer at scale — but it's a paid
  service past a small free tier, and it's another moving part to learn.
- The hand-rolled engine above is ~400 lines and you'll understand every one of them.
- **Escape hatch:** the schema above (`id`/`updated_at`/`deleted_at`/`rev`) is exactly what PowerSync
  expects. If sync becomes painful, swapping it in is a contained change. Design for it now, adopt
  it only if needed.

## 6. AI integration

**The Anthropic API key never touches the client.** All calls go through an Edge Function.

| Job | Model | Why |
|---|---|---|
| Capture triage (classify + extract) | `claude-haiku-4-5` | High volume, cheap, structured output is enough |
| Task decomposition | `claude-sonnet-5` | Quality matters — this is the differentiating feature |
| Weekly review summary | `claude-haiku-4-5` | Once a week, low stakes |

Rules:
- **Structured outputs via tool use**, not free-text parsing. Zod schema shared between the Edge
  Function and the client.
- **Batch triage**: captures are queued and processed in groups of up to 20 in one call, on a
  30-second debounce or on app background. Roughly a 10× cost reduction vs per-capture calls.
- **Prompt caching** on the system prompt (it's long — decomposition rules + user context).
- **Hard per-user daily spend cap** enforced in the Edge Function against a `ai_runs` ledger
  (NFR-10). Over cap → graceful degradation, not an error.
- **Every AI call is logged** to `ai_runs` with tokens + cost, so you can actually see unit economics.
- **The app must be fully usable with AI off.** Settings toggle, respected everywhere.

## 7. The native iOS extension (the one Swift you'll write)

Live Activities (Lock Screen + Dynamic Island timer) and Home Screen widgets cannot be done in pure
React Native. The shape:

```
ios/
  RudderWidgets/                    ← a WidgetKit extension target
    RudderWidgetBundle.swift
    TimerLiveActivity.swift         ← ~150 lines of SwiftUI
    NextActionWidget.swift          ← ~80 lines
    Shared/AppGroupStore.swift      ← reads state from a shared App Group
plugins/
  withRudderWidgets.js              ← Expo config plugin: adds the target at prebuild
```

- React Native writes timer/next-action state into a **shared App Group** container.
- The widget reads it. No bridge, no IPC complexity.
- Written in VS Code on Windows; compiled on EAS's macOS runners. You never open Xcode.
- Libraries that reduce the work: `expo-apple-targets` (generates the target from config) or
  `react-native-live-activity`.

**Sequencing:** ship v1 without Live Activities (in-app timer + notifications only), add it in v1.1.
It's the highest-delight-per-line feature but it is not a blocker.

## 7a. The scorer — where the product lives

One pure function ranks every candidate from all seven systems into a single ordering (FR-2.7,
Principle II). Per-system ranking merged afterwards is prohibited, because merging reintroduces the
choice the scorer exists to remove.

```
src/domain/
├── scorer/
│   ├── score.ts          // the ranking function — pure, no imports outside domain
│   ├── weights.ts        // constants in v1, user-tunable in v1.1
│   ├── candidates.ts     // Candidate type: the union every system compiles down to
│   └── damping.ts        // load → effort multiplier
├── load/                 // allostatic load, computed never stored (FR-4.5)
├── drift/                // per-person drift from the interactions log
├── calibration/          // rolling median of actual/estimate → automatic buffers
└── streaks/              // cadence windows over habit_events
```

**The `Candidate` type is the integration seam.** Every system produces `Candidate[]`; the scorer
knows nothing about quests, people, or medications specifically. Adding an eighth system means
emitting candidates, not touching the scorer.

Constraints: no React, no I/O, no `Date.now()` (time is injected), 100% branch coverage (NFR-17),
full re-rank of 2,000 candidates under 16ms (NFR-16). It runs synchronously on every SENSE change.

## 8. Security & privacy posture

### 8.1 The location boundary

The single most important architectural line in the product (Principle XII).

```
        DEVICE                          │            SERVER
  ────────────────────────────────────  │  ─────────────────────────
  places (lat, lon, radius)   LOCAL     │   ✗ no table exists
  place_visits                LOCAL     │   ✗ no table exists
  geofence_registry           LOCAL     │   ✗ no table exists
                                        │
  quest_triggers.place_id  ──────────►  │   quest_triggers.place_id
                                        │   (opaque uuid, no geometry)
```

- Coordinates resolve **only** in device SQLite. The server cannot leak what it was never given.
- Region monitoring is OS-managed (≤20 regions, NFR-9) with a rolling active set re-evaluated on
  significant-location-change. This is what keeps background battery at ≤1%/day (NFR-7).
- Continuous positioning exists **only** inside an explicitly started, user-visible, user-ended
  session (FR-9.2). There is no always-on tracking mode to accidentally leave enabled.
- On a new device, place-bound quests arrive intact but dormant until re-anchored. A dormant quest is
  recoverable; a leaked home address is not.

### 8.2 General posture

- **RLS on every table, no exceptions.** Default-deny; explicit `user_id = auth.uid()` policies.
  Verify with `supabase db lint` and a test that runs every query as an unauthorized user.
- **`service_role` key exists only in Edge Function env**, never in the client, never in git.
- Secrets: `.env.local` (gitignored) → EAS Secrets for builds → Supabase Function secrets for server.
- **Sentry scrubbing**: `beforeSend` strips `title`, `body`, `note`, `medication_name`, all
  check-in values, and — new in v2.0 — `contact names`, `place labels`, and any coordinate-shaped
  value. Enforce it with a unit test, not a convention (NFR-11).
- **Contact data** (Bonds) is third-party personal data: RLS-isolated, never sent to any SDK, and
  there is no schema that could express a cross-user edge.
- **No money is held.** Real-money settlement (P2) runs through a licensed third-party processor
  directly from user to endorsed destination. The app has no wallet, no balance, no escrow, no
  pooling. Soft currency is an append-only event log with no cash value.
- Voice notes in Supabase Storage under a per-user prefix with a Storage RLS policy; signed URLs
  with short TTL.
- Health data (P4): stored in Postgres, **never written to iCloud** (App Store Guideline 5.1.3),
  never shared with any third party, never used for advertising.
- Local SQLite is inside the app sandbox; enable iOS Data Protection (`NSFileProtectionComplete`)
  and gate the app behind Face ID optionally (Settings → "Require Face ID").

## 9. Environments

| Env | Supabase project | Expo channel | Purpose |
|---|---|---|---|
| `local` | `supabase start` (Docker on Windows) | dev client | Day-to-day work, free, offline |
| `staging` | Free project #1 | `preview` | TestFlight internal builds |
| `prod` | Free project #2 → Pro at launch | `production` | Your iPad + eventual App Store |

Free tier allows exactly 2 active projects — so `local` must be Docker, not a third cloud project.
See [08-free-tier-stack.md](08-free-tier-stack.md).

## 10. Repository layout

```
rudder/
├── app/                      expo-router routes
│   ├── (tabs)/               now · map · record · backlog
│   ├── capture/              modal
│   ├── quest/[id]/
│   ├── session/[id]/
│   └── ledger/               stakes (P2) — deliberately plain, no companion vocabulary
├── src/
│   ├── db/                   drizzle schema, migrations, queries
│   ├── sync/                 outbox, puller, cursor, conflict rules
│   ├── domain/               scorer, load, drift, calibration, streaks — PURE, unit-tested
│   ├── systems/              one folder per system: quests · rhythms · regulation ·
│   │                         bonds · solitude · record · stakes
│   ├── companion/            voice catalogue, states, observation scheduler
│   ├── location/             geofence registry, place resolution — never crosses the wire
│   ├── ui/                   design system primitives
│   └── lib/                  supabase client, notifications, time
├── supabase/
│   ├── migrations/           versioned SQL
│   ├── functions/            triage · decompose · schedule-push · export
│   └── seed.sql
├── ios/RudderWidgets/        Swift widget extension
├── plugins/                  Expo config plugins
├── docs/                     ← you are here
└── .github/workflows/
```

**`src/domain/` is pure TypeScript with no React and no I/O.** The cross-system scorer, allostatic
load, drift, the calibration factor, the streak-repair rules, and the capacity calculation all live
there and are 100% unit-testable without a simulator. That's where the product actually lives, and
it's the part worth testing hardest.

**`src/systems/` depends on `src/domain/`, never the reverse.** Each system exposes exactly one
thing upward: a function producing `Candidate[]`. That inversion is what keeps the scorer from
growing a special case per system, and it is the reason an eighth system would be cheap.
