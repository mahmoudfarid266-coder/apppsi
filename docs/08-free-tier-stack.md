# Rudder — The Zero-Cost Stack

How far you can get on free tiers, where the walls are, and what the unavoidable costs actually are.

> **Verification note:** the Supabase and Expo limits below were checked on **2026-07-27** and are
> sourced. The rest are from general knowledge of these providers' free tiers — **confirm current
> terms on each pricing page before you depend on them.** Free tiers change without much warning.

---

## 1. The bottom line

| Scenario | Monthly | Yearly | What you get |
|---|---|---|---|
| **Pure $0** | $0 | $0 | App runs via Expo Go + local Supabase. Real iPad install only via SideStore, 7-day expiry. AI features off. |
| **$0 + AI** | ~$1–3 | ~$12–36 | Same, plus Claude-powered triage and decomposition for one user |
| **Realistic personal** ⭐ | ~$10 | **~$120** | $99/yr Apple + ~$2/mo AI. TestFlight on your iPad, OTA updates, everything works. **This is the one to pick.** |
| **Public launch** | ~$60 | ~$720 | Above + Supabase Pro ($25) + Expo paid tier if you exceed builds + a domain |

**There is exactly one unavoidable cost: Apple's $99/year Developer Program.** Everything else in
this app can run free until you have real users. Apple is the toll booth; nothing routes around it
except the 7-day SideStore path in [06-shipping.md](06-shipping.md) §6.

---

## 2. Free tier by component

### 2.1 Backend — Supabase Free ✅ verified 2026-07-27

| Resource | Free tier |
|---|---|
| Database storage | 500 MB |
| Monthly Active Users | 50,000 (only counted on login) |
| Edge Function invocations | 500,000/month |
| API requests | Unlimited |
| Database egress | 5 GB |
| File storage | 1 GB (+5 GB storage egress) |
| Realtime | 200 concurrent connections, 2M messages/month |
| Active projects | **2** |

**Two gotchas that will bite you:**

1. **Projects pause after ~1 week of inactivity.** For your daily-driver personal app this never
   triggers. For a `staging` project you touch occasionally, it will — you'll open it one day and
   the API is dead until you click restore. Mitigate with a free UptimeRobot monitor hitting a
   health endpoint daily.
2. **Auth emails are heavily rate-limited on the free tier** (a handful per hour). Magic-link login
   will appear "broken" the moment you test it a few times. **Fix: configure custom SMTP** in
   Supabase → Auth → SMTP Settings, pointed at Resend's free tier (§2.6). Do this on day one, not
   after you've spent an evening debugging it.

Sizing for Rudder: 500 MB is enormous for this schema. Tasks, captures, sessions, and logs are all
small text rows. A heavy single user generates maybe 5–20 MB/year. Voice notes are what would eat
the 1 GB storage — cap them at 60 seconds and delete the audio after transcription.

- <https://supabase.com/pricing>

### 2.2 Local development — Supabase CLI ✅ completely free, unlimited

```bash
npm install -g supabase
```
```bash
supabase init && supabase start
```

Runs the entire Supabase stack in Docker on your Windows machine (needs Docker Desktop with the WSL2
backend). Full Postgres, Auth, Storage, Realtime, Edge Functions — no quotas, no pausing, works
offline. **Do 90% of your development here** and treat the cloud projects as deploy targets. This
also preserves both of your free cloud project slots for `staging` and `prod`.

### 2.3 Builds — Expo EAS Free ✅ verified 2026-07-27

| Resource | Free tier |
|---|---|
| iOS builds | **15/month** |
| Android builds | 15/month |
| EAS Update MAU | 1,000 |
| Edge bandwidth | 100 GiB |
| Push notifications | **Unlimited, free, forever** |

15 iOS builds/month is genuinely enough *if* you use EAS Update for JS changes. A realistic month
looks like 3–5 real builds (native dependency changes) and dozens of OTA updates. Expo Push being
free and unlimited removes what would otherwise be a real cost line.

- <https://docs.expo.dev/billing/plans/>

### 2.4 Source control & CI — GitHub Free

- Unlimited private repositories
- GitHub Actions: ~2,000 minutes/month on private repos — but **macOS runners bill at a 10×
  multiplier**, so that's only ~200 macOS minutes. One iOS build is ~15–25 min, so ~8–13 builds.
- **Public repos get unlimited free Actions minutes, including macOS.** If Rudder is open source,
  your build capacity is effectively unlimited.

Use Actions for lint/typecheck/unit tests (cheap Linux runners) and let EAS handle iOS builds.
Only reach for macOS runners for the free-IPA path in §5.

### 2.5 Marketing site & privacy policy — Cloudflare Pages Free

You need a public URL for the Privacy Policy (mandatory for App Store submission) and a support URL.

- Unlimited static requests and bandwidth
- Generous monthly build allowance
- Free `*.pages.dev` subdomain, free SSL

```bash
npm create cloudflare@latest rudder-site -- --framework=next
```

**This is where 21st.dev / Framer Motion actually belong** — it's a real web project, so
React + Tailwind + shadcn output works here (see [05-toolchain.md](05-toolchain.md) §3.3, §5).

Alternatives: Vercel Hobby (free, non-commercial only — read the terms if you monetise),
GitHub Pages (free, static only, fine for a privacy policy).

### 2.6 Transactional email — Resend Free

Roughly 3,000 emails/month, 100/day on the free tier. Needed for Supabase Auth magic links (see the
gotcha in §2.1). A single user needs a handful per month.

Alternatives: Brevo, Mailgun's trial, or AWS SES (~$0.10/1000, effectively free at this volume but
more setup).

### 2.7 Crash reporting — Sentry Developer (free)

Around 5k errors + 10k performance units/month, 1 user seat. Ample for personal use and early
launch. Remember the NFR-9 scrubbing rules — the `beforeSend` hook stripping health fields is
mandatory, not optional.

### 2.8 Product analytics — PostHog Free

~1M events/month free, and it self-hosts if you'd rather own the data. For a health-adjacent app,
PostHog's EU cloud region is the better default. **Event names only, never content.**

### 2.9 Payments (post-v1) — RevenueCat Free

Free until roughly $2,500/month in tracked revenue. Handles StoreKit 2, receipt validation,
subscription state, and grace periods — all things you should not hand-roll. Zero cost until Rudder
is actually earning.

### 2.10 Design — Figma Free

Free tier: 3 design files + unlimited personal drafts. Enough for one app's component library.
Figma MCP is already connected in your environment ([05-toolchain.md](05-toolchain.md) §3.2).

### 2.11 Monitoring — UptimeRobot Free

50 monitors, 5-minute intervals. Point one at a Supabase health endpoint to keep free projects from
pausing (§2.1 gotcha #1).

---

## 3. AI costs — the only recurring bill worth modelling

Anthropic's API has no free tier. But the actual numbers for a single user are small:

| Job | Model | Frequency | Rough monthly cost (1 user) |
|---|---|---|---|
| Capture triage | `claude-haiku-4-5` | ~30/day, batched 20-per-call | **< $0.50** |
| Task decomposition | `claude-sonnet-5` | ~3/day | **~$1.50** |
| Weekly review | `claude-haiku-4-5` | 4/month | **< $0.05** |

**~$2/month for your personal use.** The batching and prompt-caching strategies in
[02-architecture.md](02-architecture.md) §6 are what keep it there — per-capture calls instead of
batched would be roughly 10× that.

### Genuinely free AI alternatives

If you want $0 including AI:

| Option | Free tier | Trade-off |
|---|---|---|
| **Google Gemini API** | Generous free tier on Flash models | Different API; quality on decomposition is the thing to test |
| **Groq** | Free tier, open-weight models, very fast | Rate-limited; open models are weaker at structured decomposition |
| **Cloudflare Workers AI** | Free daily allocation | Small models; fine for classification, weak for decomposition |
| **Ship AI off** | $0 | Rudder is designed to work fully without AI (FR-1.2) — you lose auto-triage and decomposition |

**Pragmatic split:** use a free tier (Gemini Flash or Groq) for *triage* — it's a classification
task and cheap models handle it fine — and pay for Claude only on *decomposition*, which is the
feature that actually differentiates the product. That's maybe $1.50/month.

**Architect for this now:** put the model call behind a single `callModel()` interface in the Edge
Function so swapping providers is a config change, not a refactor.

---

## 4. What each wall actually feels like

| Wall | When you hit it | What it costs to pass |
|---|---|---|
| Apple Developer Program | Immediately, if you want a stable iPad install | $99/yr — unavoidable |
| Supabase 2-project limit | When you want local + staging + prod in the cloud | $0 — run local in Docker instead |
| Supabase project pausing | Any project you don't touch weekly | $0 — UptimeRobot ping |
| Supabase auth email limits | Your third magic-link test | $0 — custom SMTP via Resend |
| Supabase 500 MB DB | Somewhere north of 1,000 active users | $25/mo Pro |
| EAS 15 builds/month | Only if you rebuild natively several times a week | $0 — use `eas update` for JS |
| EAS Update 1,000 MAU | At 1,000 real users | Paid Expo plan |
| Sentry 5k errors | If something crash-loops in production | Free until then; fix the crash |
| RevenueCat | $2.5k/mo revenue | A good problem |

---

## 5. The fully-free IPA path (no Apple Developer Program)

If you're committing to the SideStore route from [06-shipping.md](06-shipping.md) §6, you still need
an `.ipa`, and EAS won't produce one without Apple credentials. The free workaround is a GitHub
Actions macOS runner building **unsigned** — SideStore then signs it on-device with your free Apple ID.

`.github/workflows/unsigned-ipa.yml`:
```yaml
name: Unsigned IPA
on: [workflow_dispatch]
jobs:
  build:
    runs-on: macos-14        # free & unlimited on public repos
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx expo prebuild --platform ios --no-install
      - run: |
          xcodebuild -workspace ios/Rudder.xcworkspace \
            -scheme Rudder -configuration Release \
            -sdk iphoneos -derivedDataPath build \
            CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO
      - run: |
          mkdir -p Payload
          cp -r build/Build/Products/Release-iphoneos/Rudder.app Payload/
          zip -r Rudder.ipa Payload
      - uses: actions/upload-artifact@v4
        with: { name: Rudder-ipa, path: Rudder.ipa }
```

Download the artifact, transfer to the iPad, install via SideStore. Remember: **7-day expiry, max 2
sideloaded apps besides SideStore itself**, and no push notifications (those need a paid team's APNs
entitlement) — which meaningfully guts P2 and P4, since Rudder's whole time-blindness and medication
value depends on notifications firing.

**That last point is the real argument.** The free path doesn't just cost you convenience; it costs
you the notification engine, and the notification engine is half the product.

---

## 6. Recommended $0-until-you-need-it setup

```bash
npm install -g supabase eas-cli
```
```bash
supabase init && supabase start
```
```bash
npx create-expo-app@latest rudder
```
```bash
npx expo start
```

That's a complete, working, entirely free development environment on Windows. Add the $99 Apple
enrollment in week one so it's approved by the time you need it, add Resend SMTP on day one, and
don't pay for anything else until you have users.

---

## Sources

- [Supabase pricing](https://supabase.com/pricing) · [Supabase free tier limits 2026](https://uibakery.io/blog/supabase-pricing)
- [Expo plans & billing](https://docs.expo.dev/billing/plans/) · [EAS free plan limits](https://expo.dev/changelog/2023-08-01-eas-free-plan-limits)
- [Expo internal distribution](https://docs.expo.dev/build/internal-distribution/)
- [SideStore FAQ](https://docs.sidestore.io/docs/faq)
