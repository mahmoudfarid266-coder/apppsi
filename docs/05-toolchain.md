# Rudder — AI Toolchain: Claude Code Skills, Plugins & MCP Servers

Research current as of **July 2026**. Every install command below is transcribed from the project's
own docs — but these repos move fast, so re-check the README before running anything.

---

## ⚠️ Read this before installing anything

There is a real failure mode here: **installing six agent frameworks at once makes Claude worse, not
better.** They inject competing instructions, they each consume context window, and Spec Kit /
SuperClaude / Superpowers all try to own your development *process* — they will fight each other.

**Recommended minimal set for this project** (rationale in §7):

| Layer | Pick | Why |
|---|---|---|
| Process | **Spec Kit** | You already have specs; it formalises spec→plan→tasks→implement |
| Engineering discipline | **Superpowers** | TDD + brainstorming skills; complements Spec Kit rather than duplicating it |
| Design intelligence | **UI UX Pro Max** | Generates the design system; stack-aware |
| Design reference | **Mobbin MCP** | Real shipped screens, framework-agnostic — works for React Native |
| Design handoff | **Figma MCP** | Already connected in your environment |
| Backend | **Supabase MCP** | Direct schema/migration/RLS work from Claude Code |

Skip SuperClaude (overlaps Superpowers), skip Nexus (unclear which project you mean), and treat
21st.dev as web-only (see §5.2).

---

## 1. Process frameworks

### 1.1 GitHub Spec Kit — ✅ recommended

Spec-Driven Development toolkit from GitHub. Seven phases: **Constitution → Specify → Clarify →
Plan → Tasks → Analyze → Implement**. Artifacts land in a version-controlled `.specify/` directory,
which means your requirements live in git next to the code.

```bash
uvx --from git+https://github.com/github/spec-kit.git specify init --here --ai claude
```

(Requires `uv` — install with `winget install astral-sh.uv` on Windows.)

Adds slash commands: `/constitution`, `/specify`, `/clarify`, `/plan`, `/tasks`, `/analyze`,
`/implement`.

**Fit for Rudder:** strong. The `docs/` you now have maps almost 1:1 onto Spec Kit's artifacts —
[00-overview.md](00-overview.md) §3 principles become the *constitution*, [01-prd.md](01-prd.md)
becomes the *spec*, [02-architecture.md](02-architecture.md) becomes the *plan*. Run
`/constitution` first and paste in the ten design principles; they'll then constrain every later
generation.

- Repo: <https://github.com/github/spec-kit>
- Announcement: <https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/>

### 1.2 Superpowers (obra) — ✅ recommended

By Jesse Vincent. Currently the most-starred Claude Code skills repo. A composable skills library
(brainstorming, test-driven-development, using-git-worktrees, debugging, code review) plus
instructions that make Claude actually reach for them. Skills trigger automatically — you don't
invoke them by name.

```bash
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

**Fit for Rudder:** strong, and it's the complement to Spec Kit rather than a competitor — Spec Kit
governs *what* gets built, Superpowers governs *how well*. Its TDD skill enforcing RED-GREEN-REFACTOR
is exactly what `src/domain/` (the Next Action scorer, calibration, streak rules) needs, since that
code is pure and highly testable.

- Main: <https://github.com/obra/superpowers>
- Skills: <https://github.com/obra/superpowers-skills>
- Marketplace: <https://github.com/obra/superpowers-marketplace>
- Experimental: <https://github.com/obra/superpowers-lab>

### 1.3 SuperClaude Framework — ⚠️ skip for this project

v7.0.0: 19 agent personas, 27 commands, 43 skills, 6 framework modes (brainstorming, introspection,
task_management, token_efficiency, orchestration), plus a Python orchestration layer with quality
gates.

```bash
pipx install SuperClaude && SuperClaude install
# or
npm install -g @bifrost_inc/superclaude && superclaude install
```

**Verdict:** genuinely impressive, but it heavily overlaps Superpowers and it's opinionated enough
that running both means two systems telling Claude how to work. It's aimed at large teams
orchestrating many agents. For a solo dev on a greenfield app, it's weight you'll pay for on every
single prompt. Revisit if Superpowers proves too thin.

*(Not affiliated with or endorsed by Anthropic.)*

- <https://github.com/SuperClaude-Org/SuperClaude_Framework>

### 1.4 "Nexus" — ⚠️ ambiguous, need disambiguation

There are at least four unrelated things called Nexus in this space. None is an obvious win here:

| Project | What it is |
|---|---|
| [simota/agent-skills](https://github.com/simota/agent-skills) | 124 specialist agents, Anthropic Agent-Skills-spec-aligned, with **hub-spoke orchestration via "Nexus"** — this is most likely what you meant |
| [Remote-Skills/nexus](https://github.com/Remote-Skills/nexus) | A standalone CLI agent for file operations, claiming lower token cost. A Claude Code *alternative*, not an add-on |
| [williamzujkowski/nexus-agents-skill-packs](https://github.com/williamzujkowski/nexus-agents-skill-packs) | Domain skill packs (K8s, Cloud Foundry, security) — nothing ADHD/mobile relevant |
| [nexus-labs-automation/agent-observability](https://github.com/nexus-labs-automation/agent-observability) | LLM tracing / multi-agent cost tracking plugin |

**Recommendation:** none for v1. If you meant the first one, its 124 agents are a superset of what
Superpowers gives you with more orchestration overhead. Tell me which one you had in mind and I'll
evaluate it properly against the stack.

---

## 2. Design intelligence

### 2.1 UI UX Pro Max — ✅ recommended

84 UI styles, 192 product-aligned colour palettes, 74 Google-Fonts pairings, 161 industry reasoning
rules, and 22 tech-stack targets. Auto-activates when you ask for UI work.

**Option A — Claude Code plugin marketplace:**
```bash
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill
```

**Option B — CLI (the project's recommended path):**
```bash
npm install -g ui-ux-pro-max-cli
```
```bash
cd C:\Users\mahmo\app
```
```bash
uipro init --ai claude
```

**Global install instead** (writes to `~/.claude/skills/`, available in every project):
```bash
uipro init --ai claude --global
```

Direct design-system generation:
```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "adhd focus app calm low stimulation" --design-system
```

**Fit for Rudder:** good, with a caveat — its palette engine optimises for conventional product
categories, and Rudder has a hard constraint most apps don't (**no red anywhere**, see
[04-wireframes.md](04-wireframes.md) §4). Feed it the design principles from
[00-overview.md](00-overview.md) §3 as constraints, then override its output where it conflicts.
Use it to generate the token set, not to make the calls.

- <https://github.com/nextlevelbuilder/ui-ux-pro-max-skill>

### 2.2 Alternatives worth knowing

| Skill | Use when |
|---|---|
| [ceorkm/mobile-app-ui-design](https://github.com/ceorkm/mobile-app-ui-design) | **Mobile-specific** — patterns from Airbnb/Duolingo/Spotify. Arguably a better fit than UI UX Pro Max for a pure mobile app |
| [szilu/ux-designer-skill](https://github.com/szilu/ux-designer-skill) | Guidance synthesised from NN/g, WCAG 2.2, Material Design. Best for the **accessibility** work (NFR-6) |
| [HermeticOrmus/LibreUIUX-Claude-Code](https://github.com/HermeticOrmus/LibreUIUX-Claude-Code) | 67 design agents + tested prompts; heavier |

---

## 3. Design reference (MCP)

### 3.1 Mobbin MCP — ✅ recommended

Official MCP from Mobbin. 621,500+ curated screens, 130,200+ user flows, 1,651+ shipped apps,
updated weekly. Query in natural language: *"show me 43 paywalls from fintech"*, *"pull-to-refresh
animations from social apps"*, *"timer screens from productivity apps"*.

```bash
claude mcp add --transport http mobbin https://mobbin.com/mcp
```

Then authenticate in an interactive session — **requires a paid Mobbin account**.

**Fit for Rudder:** the single most valuable design tool on this list. It returns *screen references*,
not code, so unlike 21st.dev it's completely framework-agnostic — equally useful for React Native.
It's how you avoid inventing a timer screen from scratch.

- Official: <https://mobbin.com/mcp>
- Unofficial alternative (reverse-engineered, still needs a paid session cookie):
  <https://github.com/pdcolandrea/mobbin-mcp>

### 3.2 Figma MCP — ✅ already connected

The official Figma MCP is already available in this environment. Both directions:
- **Code → Figma:** push these wireframes into a real Figma file (`use_figma`, `generate_figma_design`)
- **Figma → Code:** turn designs into React Native components (`get_design_context`)
- **FigJam:** render the ERD and navigation map as editable diagrams (`generate_diagram`)

Figma's free tier covers a solo dev comfortably. Load the `/figma-use` skill before calling
`use_figma`.

### 3.3 21st.dev (Magic MCP) — ⚠️ web only, not for the app

Search 10,000+ components, generate UI from natural language, publish your own. Now the unified
**21st MCP**; the `@21st-dev/magic` package still works for old configs.

```bash
npx @21st-dev/cli@latest install
```
Or manually:
```bash
claude mcp add --transport http 21st https://mcp.21st.dev/mcp
```

Usage: type `/ui a calm circular countdown timer` and it writes component files into your project.

**Pricing:** search, publishing and management are free; **installs are capped at 2/day on the free
tier**; the 21st AI generation features need paid credits.

**The critical caveat:** 21st.dev emits **React + TypeScript + Tailwind CSS + shadcn/ui + Radix**.
Those are **web** libraries. `shadcn/ui` and Radix render DOM elements (`<div>`, `<button>`) which do
not exist in React Native. **You cannot drop 21st.dev output into the Rudder app.**

Where it *is* useful:
- The **marketing/landing site** (Next.js on Cloudflare Pages — free, see [08-free-tier-stack.md](08-free-tier-stack.md))
- A future **web dashboard** for the trends/correlation views
- As *visual inspiration* you then hand-port to Nativewind

- <https://github.com/21st-dev/magic-mcp> · <https://21st.dev/mcp>

---

## 4. Backend & ops MCP

```bash
claude mcp add --transport http supabase https://mcp.supabase.com/mcp
```
Schema inspection, migrations, RLS policy authoring, log queries. **Add `--read-only` until you
trust it against a project holding real data.**

```bash
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp
```
Pull crash context straight into a debugging session.

```bash
claude mcp add --transport http context7 https://mcp.context7.com/mcp
```
Version-accurate docs for Expo / Reanimated / Drizzle / Supabase — these libraries change fast
enough that stale training data is a real source of broken code.

---

## 5. Animation libraries — the Framer Motion question

You asked how to install Framer Motion. Important distinction first:

### 5.1 Framer Motion is a **web** library

Framer Motion (rebranded **Motion**, `motion.dev`) animates DOM elements. React Native has no DOM.
**It will not work in the Rudder app.** Installing it into an Expo project either fails at build or
silently does nothing.

Install it for the **marketing site / web dashboard** only:

```bash
npm install motion
```
```jsx
import { motion } from "motion/react";
<motion.div animate={{ opacity: 1 }} transition={{ duration: 0.2 }} />
```

(The legacy package name still works: `npm install framer-motion`, imported from `framer-motion`.)

### 5.2 What to use in React Native instead

| Need | Library | Install |
|---|---|---|
| **Everything** — the drainage disc, gestures, 60fps on the UI thread | `react-native-reanimated` | `npx expo install react-native-reanimated` |
| **Framer-Motion-style declarative API** on top of Reanimated | `moti` | `npm install moti` |
| Gestures | `react-native-gesture-handler` | `npx expo install react-native-gesture-handler` |
| The radial timer arc, charts | `@shopify/react-native-skia` | `npx expo install @shopify/react-native-skia` |

**Moti is the answer if you like Framer Motion's API.** It was explicitly designed to bring that
declarative `animate={{ }}` style to React Native, and it compiles down to Reanimated:

```bash
npm install moti
```
```jsx
import { MotiView } from 'moti'
<MotiView
  from={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ type: 'timing', duration: 180 }}
/>
```

That 180ms matches the motion token in [04-wireframes.md](04-wireframes.md) §4 — and remember every
animation must collapse to 0ms in low-stim mode (FR-0.2).

---

## 6. Suggested install order

Do these one at a time and check Claude Code still behaves between each. Adding four frameworks in
one go and then debugging the interaction is miserable.

```bash
winget install astral-sh.uv
```
```bash
uvx --from git+https://github.com/github/spec-kit.git specify init --here --ai claude
```
```bash
/plugin marketplace add obra/superpowers-marketplace
```
```bash
/plugin install superpowers@superpowers-marketplace
```
```bash
npm install -g ui-ux-pro-max-cli && uipro init --ai claude
```
```bash
claude mcp add --transport http mobbin https://mobbin.com/mcp
```
```bash
claude mcp add --transport http supabase https://mcp.supabase.com/mcp
```
```bash
claude mcp add --transport http context7 https://mcp.context7.com/mcp
```

Then commit `.claude/`, `.specify/`, and `.mcp.json` so the setup is reproducible.

---

## 7. The honest summary

| Tool | Verdict | Cost |
|---|---|---|
| **Spec Kit** | ✅ Install — owns your process, maps onto docs you already have | Free |
| **Superpowers** | ✅ Install — engineering discipline, complements Spec Kit | Free |
| **UI UX Pro Max** | ✅ Install — design system generation, override its palette | Free |
| **Mobbin MCP** | ✅ Install — best-value design tool here, framework-agnostic | Paid Mobbin account |
| **Figma MCP** | ✅ Already connected | Free tier fine |
| **Supabase MCP** | ✅ Install read-only | Free |
| **Context7 MCP** | ✅ Install — stops hallucinated Expo/Reanimated APIs | Free |
| **SuperClaude** | ⏭️ Skip — overlaps Superpowers, heavy for solo | Free |
| **Nexus** | ❓ Ambiguous — tell me which one | — |
| **21st.dev** | ⚠️ Web only — marketing site, not the app | Free tier, 2 installs/day |
| **Framer Motion** | ⚠️ Web only — use **Moti + Reanimated** in the app | Free |

Sources: [spec-kit](https://github.com/github/spec-kit) ·
[GitHub Blog on SDD](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/) ·
[obra/superpowers](https://github.com/obra/superpowers) ·
[SuperClaude_Framework](https://github.com/SuperClaude-Org/SuperClaude_Framework) ·
[simota/agent-skills](https://github.com/simota/agent-skills) ·
[Remote-Skills/nexus](https://github.com/Remote-Skills/nexus) ·
[ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) ·
[mobile-app-ui-design](https://github.com/ceorkm/mobile-app-ui-design) ·
[ux-designer-skill](https://github.com/szilu/ux-designer-skill) ·
[Mobbin MCP](https://mobbin.com/mcp) ·
[pdcolandrea/mobbin-mcp](https://github.com/pdcolandrea/mobbin-mcp) ·
[21st-dev/magic-mcp](https://github.com/21st-dev/magic-mcp) ·
[21st.dev/mcp](https://21st.dev/mcp)
