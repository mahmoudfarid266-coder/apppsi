# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]

**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]

**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]

**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]

**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]

**Project Type**: [e.g., library/cli/web-service/mobile-app/compiler/desktop-app or NEEDS CLARIFICATION]

**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]

**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]

**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Derived from `.specify/memory/constitution.md` v2.0.0. Mark each gate PASS / FAIL / N/A.
Any FAIL carried into implementation MUST be justified in Complexity Tracking below.

**Gate 0 — the loop.** Before anything else: name the stage of SENSE → DECIDE → OFFER → DO →
MARK → SETTLE that this feature occupies, and the system it belongs to (Quests, Rhythms,
Regulation, Bonds, Solitude, Record, Stakes). A feature that occupies no stage does not ship.

| # | Gate | Principle | Status |
|---|------|-----------|--------|
| 1 | No new required field, picker, or decision is added to the capture path. Local write stays <50ms with no network call. Captures cannot be lost to a conflict. | I (NON-NEGOTIABLE) | |
| 2 | Home surfaces exactly one action, drawn from a single cross-system scorer — not a per-system list merged afterwards. Offer carries exactly three affordances. Backlog is never shown by default or sorted oldest-first. | II | |
| 3 | Any duration this feature introduces is represented visually first; numeric readout is subordinate. Timer state restores from wall-clock. Any place-bound quest gets automatic travel + calibrated padding. | III | |
| 4 | No red is introduced outside destructive-confirm dialogs. No failure count, no breakable streak, no guilt copy. Companion never degrades on absence. Re-entry suppression still applies. | IV (NON-NEGOTIABLE) | |
| 5 | Every screen in this feature is completable by accepting defaults alone. Nothing asks the user to recall what the app could infer. | V | |
| 6 | Every P0 path works in airplane mode. Writes go to SQLite + outbox and return immediately. Time-critical and geofence notifications are scheduled locally, not pushed. New counters are event rows, not mutable integers. Nothing network-dependent blocks a P0 path. | VI (NON-NEGOTIABLE) | |
| 7 | Reduce Motion / Reduce Transparency / Increase Contrast / Dynamic Type honoured, companion included. Low-stim collapses animation to 0ms. Contrast ≥AA, targets ≥48pt, VoiceOver labels present. Overstim state collapses to one action. | VII | |
| 8 | Feature remains fully usable with AI disabled. AI failure, offline, and spend-cap states degrade to the manual path without surfacing an error. AI touches no stake resolution and no crisis path. | VIII (NON-NEGOTIABLE) | |
| 9 | New business rules live in `src/domain/` as pure TypeScript, developed test-first. Derived values (including drift and load) are computed, not stored. | IX | |
| 10 | If this feature touches stakes: all ten conditions of Principle X hold — opt-in per commitment, ≥2h lead time, asymmetric cap, no health behaviours, sensor proposes / human confirms, endorsed destination, monthly free unwind, auto-suspend under load, no aggregated residue, companion walled off. | X (NON-NEGOTIABLE) | |
| 11 | Companion never references money or settlement, never shames, narrates patterns not incidents, and its state is independent of streak or absence. Ledger surfaces use no companion voice or vocabulary. | XI (NON-NEGOTIABLE) | |
| 12 | Precise location never leaves the device; real-time position and location history are never exposed to another user. Social location is opt-in per place with mutual consent, block and report ship together. No continuous background positioning outside an explicit user-ended session. Feature degrades when permission is denied. | XII (NON-NEGOTIABLE) | |
| 13 | Nothing blocks or locks out. The intended action is pre-selected and one tap; declining costs ~15s of deliberate interaction, carries no guilt copy, and is never counted or surfaced later. | XIII | |
| 14 | RLS enabled with default-deny policies on every new table, covered by the CI cross-user test. No API key or `service_role` reaches the client. | Security § | |
| 15 | No PHI written to iCloud. No SDK receives task titles, capture text, medication names, check-in values, notes, contact names, place names, or coordinates. Contact records stay on-device and build no cross-user social graph. | Security § | |
| 16 | Nothing diagnoses, doses, or claims efficacy. Curriculum content is framed as exercises, never therapy or hypnotherapy. No neurotransmitter claims. Any new analytics view carries the persistent disclaimer. Crisis paths are static and human-authored. | Security § | |
| 17 | The app holds, pools, escrows, or redistributes no user funds — real-money movement runs through a licensed processor to an endorsed destination. No crypto, token, wallet, or DAO. Soft currency has no cash value and is not purchasable or convertible. | Security § | |
| 18 | If this feature requires other human users: the solo app is already the owner's daily driver, and phase N-1 has had a full week of real use. | Workflow § | |

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
