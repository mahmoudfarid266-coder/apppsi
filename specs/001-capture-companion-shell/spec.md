# Feature Specification: Capture & Companion Shell

**Feature Branch**: `001-capture-companion-shell`

**Created**: 2026-07-30

**Status**: **Ready for planning** — all clarifications resolved 2026-07-30

**Input**: Phase 1 of the sequence in `VISION.md` §11 — "Capture + sync + the companion shell.
Your daily driver starts. Companion exists from day one or the app's identity never forms."

**Governing documents**: `.specify/memory/constitution.md` v2.0.0 · `docs/01-prd.md` v2.0

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Get the thought out before it's gone (Priority: P1)

A thought arrives at a bad moment — in a queue, mid-conversation, walking. The person needs it out of
their head and somewhere trusted before it evaporates, without deciding anything about it. No list to
pick, no date to set, no category to choose. They open the app, type, and it's held.

**Why this priority**: This is the only story whose failure invalidates everything built later. A
person who loses one important thought to the app stops trusting it, and a tool you don't trust with
your thoughts is a tool you stop opening. It is also independently valuable — even with nothing else
in the product, a genuinely frictionless inbox beats what the person currently uses.

**Independent Test**: Fully testable by launching the app cold, typing a thought, and confirming it
is retained and visible afterwards. Delivers value with no other story implemented.

**Acceptance Scenarios**:

1. **Given** the app is fully closed, **When** the person opens it and begins typing, **Then** the
   first character appears within 2 seconds of the launch gesture, with no intervening screen,
   prompt, or spinner.
2. **Given** the person is typing a thought, **When** they submit it, **Then** it is retained with no
   perceptible delay and the input clears and stays ready for the next thought without changing
   screens.
3. **Given** the person submits a thought, **When** they submit it, **Then** they are asked for
   nothing else — no title, list, date, category, priority, or confirmation is requested or required.
4. **Given** a thought consisting only of a single word or a fragment, **When** submitted, **Then** it
   is accepted unchanged with no validation error.
5. **Given** the person is speaking rather than typing, **When** they hold the voice control and
   speak, **Then** the spoken words are captured as text and the original audio is retained.

---

### User Story 2 - Trust that nothing is ever lost (Priority: P2)

The person is on a plane, in a basement, or somewhere with no signal for a week. They keep capturing.
Later they open the app on a second device and everything they captured is there. Nothing silently
vanished, nothing was overwritten by the other device, nothing required a connection.

**Why this priority**: Trust is the product. It is second only to capture itself because a capture
that is later lost is worse than a capture that never succeeded — the person had already stopped
carrying the thought themselves.

**Independent Test**: Testable by disabling all connectivity, capturing over several days,
re-enabling connectivity, and confirming every item is present on a second device. Delivers value
independently as durable offline storage.

**Acceptance Scenarios**:

1. **Given** the device has no network connection, **When** the person captures thoughts over 7
   consecutive days, **Then** every capture succeeds and every one remains visible throughout.
2. **Given** captures were made with no connection, **When** connectivity returns, **Then** all of
   them become available on the person's other devices without any manual action.
3. **Given** the same person captured different thoughts on two devices while both were offline,
   **When** both reconnect, **Then** every capture from both devices is present and none has replaced
   another.
4. **Given** the app is force-closed mid-typing, **When** it is reopened, **Then** any submitted
   captures are intact.
5. **Given** the person has never signed in, **When** they use the app, **Then** every capability in
   this feature works, and their captures are retained on the device.

---

### User Story 3 - Something is there with you (Priority: P3)

On first use the person meets a companion, names it, and from then on it is present whenever they
open the app. It acknowledges that they showed up. It never comments on what they didn't do, never
looks sad or neglected when they've been away, and never counts anything against them.

**Why this priority**: The companion carries the product's identity and its emotional contract. It is
third because the app is useful without it, but if it is added later the tone of everything already
built has to be retrofitted — and retrofitted tone reads as decoration.

**Independent Test**: Testable by completing first use, naming the companion, then leaving the app
untouched for an extended period and confirming its state and language on return are unchanged in
character and contain no reference to the absence.

**Acceptance Scenarios**:

1. **Given** first use, **When** the person reaches the companion introduction, **Then** they can
   name it, and they can also skip naming and receive a default without being blocked.
2. **Given** the person has not opened the app for 60 days, **When** they open it, **Then** the
   companion's appearance and language are indistinguishable from a 1-day absence, given equal
   history.
3. **Given** any state of the person's history, **When** the companion is displayed, **Then** it never
   appears sad, sick, hungry, neglected, or disappointed — no such depiction exists to be shown.
4. **Given** the person has been away, **When** they return, **Then** nothing tells them how long they
   were gone, how much accumulated, or what they missed.
5. **Given** the person prefers plain language, **When** they turn the personality layer off, **Then**
   every capability in this feature remains fully usable.

---

### User Story 4 - Come back to a pile without dread (Priority: P4)

The person has captured forty things over two weeks and hasn't looked at any of them. They open the
inbox. It does not greet them with a count in alarming colour, an "overdue" heading, or the oldest
item first. They can read, edit, keep, or discard, one at a time, and leaving items untouched costs
them nothing.

**Why this priority**: Without this, story 1 builds a pile the person becomes afraid to look at, which
is the exact failure this product exists to prevent. It is fourth because the pile takes time to
accumulate — there is a window where stories 1–3 are usable without it.

**Independent Test**: Testable by seeding many captures of varied ages and confirming the review
experience presents no counts framed as pressure, no oldest-first default, and no penalty for
leaving items.

**Acceptance Scenarios**:

1. **Given** 40 unreviewed captures, **When** the person opens the inbox, **Then** ordering does not
   default to oldest-first, and no item is marked overdue, late, or stale.
2. **Given** any number of unreviewed captures, **When** the count is shown, **Then** it is presented
   as neutral information and never as an alert, badge, or warning colour.
3. **Given** the inbox is empty, **When** the person views it, **Then** it reads as sufficiency
   ("Nothing needs you right now") rather than absence ("0 items").
4. **Given** the person edits a capture's text, **When** they save, **Then** the original captured
   text remains recoverable.
5. **Given** the person discards a capture, **When** they discard it, **Then** it is recoverable for a
   grace period before permanent removal.

---

### Edge Cases

- **Capture during a permission prompt or interruption** — an incoming call or system dialog arrives
  mid-typing. Draft text must survive and be present on return.
- **Storage exhausted** — the device is out of space. The person must be told plainly and captures
  must not be silently dropped. This is the one place an explicit failure message is required, because
  a silent failure here breaks the product's core promise.
- **Voice capture with no permission** — microphone access denied. The voice control must degrade to
  text entry rather than presenting an error wall.
- **Very long capture** — several thousand characters pasted. Accepted without truncation.
- **Rapid repeated capture** — ten thoughts in twenty seconds. All retained, none coalesced, none
  lost to a race.
- **Same capture edited on two offline devices** — both edits must survive in a recoverable form
  rather than one silently replacing the other.
- **Clock changed or timezone crossed** — captures retain a correct, stable ordering.
- **Person signs in on a device that already holds local captures** — local captures merge into the
  account unprompted, and the person is told afterwards (FR-015).
- **Sign-in where the account already holds captures from another device** — two histories interleave.
  Both survive in full; nothing is deduplicated or reordered away (FR-015b). This is the highest
  data-loss risk in the feature.
- **Widget used while the app has never been launched** — capture must still succeed and be visible in
  the app afterwards.
- **Widget used while the device is locked** — behaviour must be defined and must not silently discard
  the thought.
- **Extremely long absence (months)** — no accumulated state, count, or summary is presented on return.

## Requirements *(mandatory)*

### Functional Requirements

**Capture**

- **FR-001**: System MUST accept a captured thought with no required fields of any kind.
- **FR-002**: System MUST make the text input ready to receive typing within 2 seconds of a cold
  launch gesture, with no intervening screen or prompt.
- **FR-003**: System MUST retain a submitted capture with no perceptible delay and without requiring
  a network connection.
- **FR-004**: System MUST clear the input and remain ready for the next capture without navigating
  away.
- **FR-005**: System MUST accept spoken input, retain both the transcribed text and the original
  audio, and degrade to text entry if microphone access is unavailable.
- **FR-006**: System MUST preserve in-progress draft text across interruption, backgrounding, and
  app termination.
- **FR-007**: System MUST accept captures of any length without truncation, and MUST accept fragments
  and single words without validation errors.
- **FR-008**: System MUST make capture available from a home-screen widget in addition to inside the
  app. The widget MUST land the person in a ready text input with the keyboard already raised, MUST
  work when the app is not already running, and MUST meet the same 2-second threshold as FR-002.
- **FR-008a**: System MUST NOT provide capture from a system control, a voice-assistant phrase, or
  sharing from another app in this phase. These are deferred, not rejected.

**Durability and continuity**

- **FR-009**: System MUST function completely with no network connection, indefinitely, for every
  requirement in this specification.
- **FR-010**: System MUST make captures available across the person's own devices once connectivity
  is present, with no manual action required.
- **FR-011**: System MUST NEVER discard, merge, or overwrite a capture as a consequence of the same
  person having used two devices. Where two devices disagree, both versions MUST survive.
- **FR-012**: System MUST retain the originally captured text as recoverable after any subsequent
  edit.
- **FR-013**: System MUST make a discarded capture recoverable for a grace period before permanent
  removal.
- **FR-014**: System MUST be fully usable without an account, and MUST retain captures made in that
  state.
- **FR-015**: When a person with existing local captures signs in, System MUST merge those captures
  into the account without prompting beforehand.
- **FR-015a**: After merging, System MUST state plainly what happened, in neutral language, on a
  surface the person cannot miss but is not blocked by.
- **FR-015b**: The merge MUST NOT lose, overwrite, deduplicate, or reorder any capture, including
  when the account already holds captures from another device. Where local and account histories
  overlap in time, both MUST survive in full.
- **FR-016**: System MUST inform the person explicitly if a capture cannot be retained due to
  exhausted device storage, and MUST NOT fail silently.
- **FR-017**: System MUST allow the person to export everything in this feature, including audio,
  without a network connection.

**Companion**

- **FR-018**: System MUST present a companion that the person can name during first use, and MUST
  supply a working default if they skip naming.
- **FR-019**: System MUST keep the companion present on the primary screen.
- **FR-020**: System MUST derive the companion's depicted state solely from the person's cumulative
  history. It MUST NOT be influenced by recent inactivity, by elapsed time since last use, or by
  anything the person did not do.
- **FR-021**: System MUST NOT contain any depiction of the companion as sad, sick, hungry, neglected,
  disappointed, or deteriorated, in any state or configuration.
- **FR-022**: System MUST NOT present, on return from any length of absence, a count of what
  accumulated, a duration of absence, or a summary of what was missed.
- **FR-023**: Companion language MUST NOT shame, guilt, express disappointment, or describe anything
  the person did as a failure or a loss.
- **FR-024**: Companion language MUST NOT reference money, amounts, charges, or settlement of any
  kind.
- **FR-025**: System MUST allow the personality layer to be disabled while every capability in this
  specification remains fully usable.
- **FR-026**: The companion MUST acknowledge two things and nothing else in this phase: that the
  person has arrived, and that a capture has been held.
- **FR-026a**: The companion MUST NOT comment on patterns, history, quantity, elapsed time, or
  anything the person has not done. It has no grounds for any of these in this phase.
- **FR-026b**: The companion's full vocabulary MUST be enumerable as a reviewable set, so that every
  line it can ever say is auditable against FR-023 and FR-024 rather than sampled.

**Reviewing captures**

- **FR-027**: System MUST NOT default any ordering of captures to oldest-first.
- **FR-028**: System MUST NOT mark any capture as overdue, late, or stale, and MUST NOT display any
  count of unreviewed items as an alert or in a colour that reads as alarm.
- **FR-029**: System MUST present an empty inbox as sufficiency rather than as absence.
- **FR-030**: System MUST allow reading, editing, keeping, and discarding a capture individually, and
  MUST impose no consequence for leaving items unreviewed for any length of time.
- **FR-031**: System MUST NOT display, anywhere, a total or rate of things not done.

**First use**

- **FR-032**: System MUST allow first use to be completed by skipping every optional step, in under
  90 seconds, arriving at a working primary screen with sensible defaults.
- **FR-033**: System MUST request each permission separately, at the point it becomes useful, framed
  by what it will do, and MUST remain fully functional in this feature if every permission is denied.

**Presentation constraints (apply to every requirement above)**

- **FR-034**: System MUST NOT use red anywhere except a confirmation for permanent deletion.
- **FR-035**: System MUST honour the operating system's reduce-motion, reduce-transparency,
  increase-contrast, and text-size settings on every screen, the companion included, with no
  exceptions.
- **FR-036**: System MUST meet WCAG 2.2 AA contrast, provide a screen-reader label for every
  interactive element, offer touch targets of at least 48pt, and render the largest supported text
  size without clipping or truncation.

### Key Entities

- **Capture** — a raw thought as the person expressed it. Has original text, optional audio, a
  creation moment, and a review state. Append-only in nature: never merged with another capture,
  never destroyed by processing, and its original wording always recoverable.
- **Person** — the owner of everything. Holds preferences (personality on/off, reduced stimulation,
  permission choices) and may exist without an account.
- **Companion** — a named presence belonging to the person. Its depicted state is a function of
  cumulative history only. Deliberately has no attribute representing mood, health, hunger, or
  neglect.
- **Device** — an endpoint the person captures from. Multiple devices hold the same captures; no
  device's version of a capture takes precedence in a way that destroys another's.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: From the launch gesture on a cold start, the person can be typing within 2 seconds, in
  95 of 100 measured attempts, **measured on the reference device (iPad Air 4th gen, A14)**. Simulator
  timings do not satisfy this criterion.
- **SC-002**: Submitting a capture shows no spinner, placeholder, or perceptible wait in any measured
  attempt.
- **SC-003**: Across a 30-day dogfooding period, **zero** captures are lost, including across offline
  stretches, multi-device use, and force-closes.
- **SC-004**: The person captures successfully on every day of a 7-consecutive-day period with all
  connectivity disabled, and every item is present afterwards.
- **SC-005**: A person who skips every optional step during first use reaches a working primary
  screen in under 90 seconds, with no dead end.
- **SC-006**: An audit of every screen in this feature finds no red outside deletion confirmation, no
  count of things not done, and no depiction of a neglected companion.
- **SC-007**: **The owner uses the app for capture every day for 7 consecutive days without
  reverting to a previous tool.** This is the phase gate — work on the next phase does not begin
  until it is met.
- **SC-008**: With every permission denied and no account, the person can still complete every
  scenario in User Stories 1, 2, and 4.
- **SC-009**: A person returning after 60 days of absence encounters no count, duration, or summary
  of the gap, verified by inspection.

## Assumptions

- **Single-person scope.** This feature serves one person and their own devices. No sharing, no other
  users, no presence of anyone else. Anything requiring other humans is out of scope by the phase gate
  in the constitution's workflow section.
- **No automated interpretation of captures in this phase.** Captures are held as the person wrote
  them. Classification, date extraction, and breaking things down are later phases; a capture with no
  processing applied is a complete and valid outcome.
- **No scheduling, ranking, or reminding in this phase.** There is no ordering of what to do next, no
  due dates, no notifications. The companion is present but is not yet offering the person anything to
  act on — that arrives with the next phase.
- **No place awareness in this phase.** No location permission is requested and no location data is
  handled.
- **Two devices are sufficient** to validate continuity requirements.
- **Reasonable defaults adopted without asking**: discarded-capture grace period of 30 days; audio
  retained at voice-note quality rather than archival; draft preservation for the current session
  plus one relaunch; a person's own device count is unbounded but assumed under five.
- **Deliberately excluded from this phase**, on the constitution's phase-gate rule: place triggers,
  the cross-system ranking of what to do next, timers, habits, medication, the dopamine menu,
  relationships, stakes and currency, the map, and all curriculum content.

---

## Clarifications

### Session 2026-07-30

All three open questions resolved by owner decision. Two of them — Q1 and Q2 — were the same
questions that stalled the previous attempt at this phase and had never been answered. The previous
attempt's third blocker, whether automated capture interpretation belongs here, was closed by
`docs/01-prd.md` v2.0 placing it at P1 in a later phase.

- **Q: When a person using the app without an account signs in, what happens to captures already on
  the device?**
  **A: Merge without prompting, then state plainly what happened afterwards.** Zero friction at the
  moment of decision, no surprise later. Consistent with Principle V — the app decides and the person
  is informed, rather than being handed a choice at the moment they least want one.
  → FR-015, FR-015a, FR-015b

- **Q: Which capture entry points ship in this phase?**
  **A: Inside the app, plus a home-screen widget.** Covers the common "phone already in hand" case at
  modest cost, and is the fastest credible route to the phase gate that still tests the core premise.
  A system control, a voice-assistant phrase, and sharing from other apps are deferred to a later
  phase — deferred, not rejected.
  → FR-008, FR-008a

- **Q: Does the companion speak in this phase, and about what?**
  **A: It acknowledges arrival and capture, and nothing else.** A deliberately tiny vocabulary. The
  value of choosing this over silence is that the language constraints (FR-023, FR-024) get built and
  verified while the full set of things it can say is small enough to audit exhaustively rather than
  sample.
  → FR-026, FR-026a, FR-026b

**Consequence for planning:** the widget is a separate platform surface with its own launch path, and
FR-008 holds it to the same 2-second threshold as the in-app path. Plan should treat it as a distinct
work item rather than a variation of the in-app capture screen.

---

**Next step**: `/speckit-plan`.
