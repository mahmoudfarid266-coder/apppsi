# Specification Quality Checklist: Capture & Companion Shell

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-07-30
**Feature**: [spec.md](../spec.md)
**Validation run**: 2 of max 3 — **all items pass**

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] **No [NEEDS CLARIFICATION] markers remain** — all 3 resolved 2026-07-30; answers written back
      into FR-008/008a, FR-015/015a/015b, FR-026/026a/026b and recorded in the spec's Clarifications
      section
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] **All functional requirements have clear acceptance criteria**
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Constitution alignment (project-specific, v2.0.0)

Not part of the standard template. Added because this project's constitution defines hard gates, and
catching a violation at spec time is cheaper than at plan time.

| Principle | Covered by | Status |
|---|---|---|
| I — Capture Is Sacred 🔒 | FR-001–007, FR-011, SC-001–004 | ✅ |
| II — One Next Action | n/a — ranking is a later phase | ⚪ N/A |
| III — Time Is Visual | n/a — no durations in this phase | ⚪ N/A |
| IV — No Punishment Mechanics 🔒 | FR-020–024, FR-027–031, FR-034, SC-006, SC-009 | ✅ |
| V — App Decides, User Vetoes | FR-001, FR-032 | ✅ |
| VI — Offline-First 🔒 | FR-003, FR-009–011, FR-017, SC-004 | ✅ |
| VII — Low-Stim By Default | FR-034–036 | ✅ |
| VIII — AI Is Optional 🔒 | Excluded by assumption — no automated interpretation this phase | ✅ |
| IX — Pure Domain Logic Test-First | Deferred to plan — no domain rules in this phase yet | ⚪ Plan |
| X — Stakes Are Contracts 🔒 | Out of scope by assumption | ⚪ N/A |
| XI — Companion Not A Creditor 🔒 | FR-021, FR-023, FR-024 | ✅ |
| XII — Location Sensitive 🔒 | Out of scope by assumption — no location handled | ✅ |
| XIII — Friction, Never Lockout | n/a — nothing to enforce in this phase | ⚪ N/A |

## Notes

**Run 1 (2026-07-30):** 2 items incomplete, both from one root cause — 3 intentional
[NEEDS CLARIFICATION] markers at the template limit. Each materially changed scope and none had a
defensible default, so none was guessed away.

**Run 2 (2026-07-30):** all clarifications resolved by owner decision. Answers written back into the
requirements and recorded in the spec's Clarifications section. **All checklist items now pass.**

Resolutions:
- **FR-015** — merge local captures on sign-in without prompting, then state plainly what happened
- **FR-008** — in-app capture plus a home-screen widget; system control, voice phrase, and share
  sheet deferred to a later phase
- **FR-026** — companion acknowledges arrival and capture only, with a vocabulary small enough to
  audit exhaustively

**Carried into planning as the two highest-risk items:**
1. **FR-015b** — sign-in where the account *already* holds captures from another device. Two
   histories interleave and nothing may be lost, deduplicated, or reordered away. This is the
   feature's largest data-loss surface and the one most likely to be got wrong quietly.
2. **FR-008** — the widget is a separate platform surface with its own cold-launch path, held to the
   same 2-second threshold as the in-app path. It is a distinct work item, not a variant of the
   in-app capture screen.

**Accepted minor deviation:** FR-036 names WCAG 2.2 AA and a 48pt touch-target minimum. These are
concrete thresholds rather than pure user outcomes, retained because an accessibility requirement
without a number is not testable. Judged not to be an implementation-detail leak.

**Gate: cleared.** Ready for `/speckit-plan`, which must complete the 18-row Constitution Check plus
Gate 0 before Phase 0 research.
