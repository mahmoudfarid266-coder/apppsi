# Rudder — ADHD Executive Function App

Planning workspace. Nothing is built yet; this is the complete spec set.

## Decisions locked

| | |
|---|---|
| **Audience** | Personal tool first, App Store later |
| **Pillars in v1** | Capture/exec-function · Time blindness · Focus sessions · Meds & mood |
| **Client** | Expo (React Native) + TypeScript — *builds from Windows, no Mac needed* |
| **Backend** | Supabase (Postgres + Auth + RLS + Realtime + Edge Functions) |
| **Local data** | SQLite (source of truth for the UI) + hand-rolled sync engine |
| **iPad install** | TestFlight, via EAS cloud builds |
| **Unavoidable cost** | $99/yr Apple Developer Program. Everything else runs free. |

## Docs

| Doc | What's in it |
|---|---|
| [00 · Overview](docs/00-overview.md) | The problem, the ten design principles, scope |
| [01 · PRD](docs/01-prd.md) | Every feature, every acceptance criterion, non-goals |
| [02 · Architecture](docs/02-architecture.md) | Stack comparison, system design, sync model, AI integration |
| [03 · Data model](docs/03-data-model.md) | ERD, Postgres DDL, RLS, local schema |
| [04 · Wireframes](docs/04-wireframes.md) | Navigation map, 27 screens, wireframes, design tokens |
| [05 · Toolchain](docs/05-toolchain.md) | Spec Kit, Superpowers, SuperClaude, Nexus, UI UX Pro Max, 21st.dev, Mobbin, Framer Motion — with install commands |
| [06 · Shipping](docs/06-shipping.md) | Windows → App Store, TestFlight, SideStore |
| [07 · Roadmap](docs/07-roadmap.md) | 20-week phased build order |
| [08 · Free tier stack](docs/08-free-tier-stack.md) | Zero-cost hosting, where the walls are |

## Start here

```bash
npm install -g supabase eas-cli
```
```bash
npx create-expo-app@latest rudder
```

Full Phase 0 checklist: [docs/07-roadmap.md](docs/07-roadmap.md#phase-0--foundations-week-1).
