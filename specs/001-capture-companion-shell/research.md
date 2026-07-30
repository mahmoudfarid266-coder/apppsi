# Phase 0 Research: Capture & Companion Shell

**Feature**: `001-capture-companion-shell` · **Date**: 2026-07-30
**Purpose**: resolve every NEEDS CLARIFICATION in the plan's Technical Context before design begins.

---

## R1 — A widget cannot contain a text field. The widget is a launcher.

**Decision**: The home-screen widget is a **deep-link target**, not a capture surface. Tapping it
cold-launches the app directly onto the capture route with the keyboard raised. FR-008's 2-second
threshold therefore applies to *app cold launch via deep link*, not to the widget itself.

**Rationale**: WidgetKit widgets are static SwiftUI snapshots rendered in a separate extension
process. Interactivity since iOS 17 is limited to `Button` and `Toggle` backed by an `AppIntent` —
**`TextField` and every other text-entry control are unsupported**, because SwiftUI will not execute
closures or mutate bindings in the host app's process space from a widget. There is no keyboard and no
first responder in a widget extension.

**Consequences for this feature**:
- FR-008 is satisfied by a widget whose entire body is a deep link. No Swift extension logic is needed
  beyond rendering, which means **no native widget target is required for this phase** — the Swift
  WidgetKit work stays deferred as `VISION.md` assumed.
- The widget's real engineering cost is therefore *not* the widget. It is making cold launch fast
  enough to still hit 2 seconds when the launch is triggered from outside the app. See R2.
- A future "quick capture without launching" is only achievable via a Control Center control or an App
  Intent with a parameter prompt — both deferred by FR-008a.

**Alternatives considered**:
- *Interactive widget with an AppIntent that captures* — rejected: no text input is possible, so the
  intent could only capture a fixed string.
- *Live Activity as capture surface* — rejected: same process and input constraints, and requires an
  active activity.

**Sources**: [Adding interactivity to widgets](https://developer.apple.com/documentation/widgetkit/adding-interactivity-to-widgets-and-live-activities) · [WidgetKit iOS 17+ interactive widgets](https://sharpskill.dev/en/blog/ios/widgetkit-ios17-interactive-widgets-app-intents)

---

## R2 — Cold launch under 2s is the feature's primary technical risk

**Decision**: The capture input **must not block on anything asynchronous**. Specifically:

1. The capture route is the app's initial route, with no provider tree above it beyond what renders a
   text field.
2. The text field is mounted and focused on first paint. It does not wait for the local database to
   open, for migrations to run, for session restore, or for the companion's assets to load.
3. Submitted text lands first in an **in-memory pending buffer**, which drains to durable storage as
   soon as the database is open. The user-visible acknowledgement fires on the buffer write.
4. Database open, migrations, session restore, sync, and companion rendering all happen *after* first
   paint, off the interaction path.
5. Hermes enabled; the capture route's bundle dependencies kept deliberately minimal.

**Rationale**: React Native cold start on an iPad Air 4 (A14, 4 GB) for a lean app is typically ~1–2s, which
leaves almost no headroom. Every provider, every synchronous storage read, and every migration check
above the first paint spends that headroom. The 2-second budget in FR-002 is a *constitutional*
threshold (Principle I), not a nice-to-have, and the widget path in R1 means the cold path is a
routine occurrence rather than an edge case.

**The buffer is the load-bearing decision.** It decouples the promise ("your thought is held") from
storage readiness. Without it, FR-003's "no perceptible delay" and FR-002's 2-second budget are in
direct competition on a cold launch.

**Risk accepted**: the pending buffer is a window in which a thought exists only in memory. Mitigated
by draining on the very next tick after DB open, and by draining on `beforeRemove`/background
transition. This window must be covered by an explicit test that kills the process mid-buffer.

**Alternatives considered**:
- *Block the input until storage is ready* — rejected: violates FR-002 on cold launch.
- *Write to a plain file first, migrate to the database later* — a viable fallback if buffer tests
  prove flaky. Adds a second durability path to reason about, so held in reserve rather than adopted.
- *Native capture screen in Swift* — would trivially hit the budget, but reintroduces the Mac/Xcode
  dependency this stack exists to avoid.

**Measurement**: instrument process start (native) to first keystroke (JS) and log in development
builds. SC-001 requires 95/100 attempts under 2s, so this needs a repeatable harness, not manual
stopwatching.

---

## R3 — Sign-in has two distinct paths, and only one of them is risky

**Decision**: Treat account adoption as **two separate flows**, because they have completely different
data implications.

| Path | What happens | Merge work |
|---|---|---|
| **Upgrade** (expected, common) | An anonymous user adds an email or OAuth identity. **The user id does not change.** | **None.** Local rows were already written under that id. FR-015 is satisfied by the identity link alone |
| **Adopt** (rare, dangerous) | A person signs into a *pre-existing* account that already holds captures from another device. The local anonymous id ≠ the target account id | **Real re-attribution.** Every local row must be rewritten to the target id, and two histories interleave |

FR-015b's guarantee — nothing lost, overwritten, deduplicated, or reordered — is entirely about the
**adopt** path. The upgrade path cannot lose data because no data moves.

**Rationale**: Supabase anonymous sign-in creates a real user row; linking an email/phone identity via
`updateUser()` or an OAuth identity via `linkIdentity()` converts it to permanent **while preserving
the same user id**, so previously-written rows remain correctly attributed. This makes the common path
free. The adopt path is the one that needs design attention, and it is also the one a naive
implementation gets wrong silently.

**Design consequence**: re-attribution on the adopt path must be a local, transactional rewrite
followed by a normal outbox drain — never a server-side merge, and never an upsert keyed on content.
Because captures are append-only and never merged (Principle I), interleaving two histories is
*append both, order by capture time* and nothing more. There is deliberately no dedupe step, which is
what makes the guarantee achievable: the only way to satisfy "never deduplicated" is to not write
dedupe logic.

**Alternatives considered**:
- *Refuse to sign into an account that already has data* — rejected: it makes a second device
  impossible.
- *Content-hash dedupe on merge* — rejected: it directly violates FR-015b, and two genuinely identical
  thoughts captured twice are two real captures.

**Sources**: [Supabase anonymous sign-ins](https://supabase.com/docs/guides/auth/auth-anonymous) · [Converting anonymous to permanent](https://github.com/orgs/supabase/discussions/29017)

---

## R4 — Platform and library versions

**Decision**: Expo **SDK 57** (current; released 2026-06-30). React Native 0.85 / React 19.2 baseline
from SDK 56.

**Rationale**: `CLAUDE.md` records "SDK 52+", written when that was current. Starting a greenfield
project two majors behind buys nothing and costs an upgrade later. SDK 57 is the current release at
project start.

| Concern | Choice | Note |
|---|---|---|
| Local database | `expo-sqlite` + `drizzle-orm` | `drizzle-kit` config `dialect: 'sqlite', driver: 'expo'`; add `sql` to Metro `resolver.sourceExts`; `inline-import` Babel plugin for `.sql` |
| DB inspection | built-in `expo-sqlite` DevTools (`Shift + M`) | Removes the need for `drizzle-studio-expo` as a separate dependency |
| Ids | client-generated **uuidv7** | Time-ordered, so index locality is good and capture ordering survives without a separate sequence |
| Voice | `expo-speech-recognition` | On-device. Must degrade to text on permission denial (FR-005) |
| Styling | `nativewind` v4 | Per `docs/02-architecture.md` |
| State | `zustand` for the pending buffer | Deliberately not React Query — the buffer must be readable synchronously during a cold paint |

**Deferred, confirmed not needed this phase**: any Swift target, `expo-notifications`,
`expo-location`, `expo-calendar`, Reanimated beyond static companion rendering, Skia, charts.

**Sources**: [Expo SDK 57](https://expo.dev/changelog/sdk-56) · [Drizzle + Expo SQLite](https://orm.drizzle.team/docs/sqlite/connect-expo-sqlite) · [expo-sqlite docs](https://docs.expo.dev/versions/latest/sdk/sqlite/)

---

## R5 — Making the no-punishment rules mechanically enforceable

Three requirements in this spec are stated as absolutes about things that *do not exist*
(FR-021, FR-023, FR-024, FR-031). Absolutes about absence cannot be verified by testing behaviour —
only by inspecting the artefact set. Two build-time checks are therefore part of this phase's scope,
not a later hardening pass.

**Decision A — companion asset manifest assertion.** The companion's states are declared in a typed
manifest. A test asserts the state set is exactly the permitted set, so adding a `sad` or `neglected`
asset fails the build rather than merely going unused (FR-021). This is what makes "no such depiction
exists to be shown" checkable.

**Decision B — copy catalogue lint.** All user-facing strings live in one catalogue. A CI check fails
the build on any string matching a banned-pattern list: currency symbols and money words (FR-024),
shame and failure vocabulary (FR-023), `!` in companion voice, and count-of-not-done phrasings
(FR-031). FR-026b's "vocabulary enumerable as a reviewable set" is satisfied by the catalogue
existing at all — which is *why* the catalogue is the right structure, rather than inline strings.

**Rationale**: these rules are the ones most likely to erode quietly, because each individual
violation looks harmless in isolation ("just a red badge", "just a streak counter"). A build that
fails is the only durable enforcement. Cheap now, and retrofitting a string catalogue across a built
app is not cheap.

**Alternatives considered**:
- *Code review discipline* — rejected: the constitution already requires automated enforcement of the
  analogous SDK-scrubbing rule, for the same reason.
- *Runtime assertions* — rejected: a runtime check on absence only fires if the offending state is
  reached, which is exactly when it is too late.

---

## Resolved unknowns summary

| # | Unknown | Resolution |
|---|---|---|
| U1 | How does widget capture work? | Deep link into the app. Widgets cannot host text input. No Swift target needed (R1) |
| U2 | Is <2s cold launch achievable? | Only if the input never blocks on storage. In-memory pending buffer required (R2) |
| U3 | What does sign-in merge involve? | Nothing on the common upgrade path (user id persists). Real re-attribution only on adopt (R3) |
| U4 | Which SDK and library versions? | Expo SDK 57, RN 0.85, expo-sqlite + drizzle, uuidv7 (R4) |
| U5 | How are "no red / no shame / no sad state" verified? | Asset manifest assertion + copy catalogue lint, both in CI this phase (R5) |
| U6 | Does this phase need a native extension? | No. Confirmed by R1 |

**No unresolved NEEDS CLARIFICATION remain.** Proceed to Phase 1.
