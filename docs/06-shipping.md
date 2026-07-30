# Rudder — Getting It Onto Your iPad, and Into the App Store

Everything here is done **from Windows**. You will not need a Mac at any point.

---

## 1. The four ways to run an iOS app on your own device

Ranked for your situation. Read §2 for the recommendation.

| # | Method | Cost | Expiry | Works from Windows? | Pain |
|---|---|---|---|---|---|
| 1 | **TestFlight (internal testing)** | $99/yr Apple Developer Program | 90 days per build | ✅ Yes, fully | 🟢 Lowest |
| 2 | **EAS internal distribution (ad-hoc)** | $99/yr | 365 days | ✅ Yes | 🟡 Must register the iPad's UDID |
| 3 | **SideStore / AltStore** (free Apple ID) | **$0** | **7 days**, auto-refreshed | ⚠️ Partially — needs a PC on the same LAN | 🔴 Highest |
| 4 | **Expo Go** (dev only) | $0 | n/a | ✅ Yes | 🟢 Low, but can't run custom native code |

## 2. Recommendation

**Use Expo Go for day-one prototyping, then move to TestFlight and stay there.**

Reasoning: you're going to the App Store eventually, which means you're paying the $99/year Apple
Developer Program fee regardless. Once you've paid it, TestFlight is strictly better than
sideloading in every dimension — no UDID registration, no 7-day refresh, no pairing files, no VPN,
installs and updates like a normal App Store app, and it's the same pipeline you'll use to ship.

**Sideloading via SideStore only makes sense if you genuinely will not pay $99.** It's documented in
§6 because you asked, and because it's the only truly $0 path — but understand what you're
signing up for.

### The one exception: Expo Go's limits

Expo Go can't run custom native code. The moment you add the Live Activity widget extension
([02-architecture.md](02-architecture.md) §7) or any library requiring a config plugin, you need a
**development build** — which is an EAS cloud build, same pipeline as everything below. Expect to
move off Expo Go around week 3.

---

## 3. Path A — the pipeline (Expo Go → dev build → TestFlight → App Store)

### 3.0 Prerequisites on Windows

```bash
node --version
```
```bash
npm install -g eas-cli
```
```bash
eas login
```

### 3.1 Day 1–3: Expo Go, zero setup

```bash
npx create-expo-app@latest rudder --template
```
```bash
cd rudder && npx expo start
```

Scan the QR code with the iPad camera. Install Expo Go from the App Store on the iPad. Hot reload
works over your LAN. **You can build the entire Now screen, capture flow, and Next Action engine
this way with no Apple account at all.**

### 3.2 Week 1: enroll in the Apple Developer Program

- <https://developer.apple.com/programs/enroll/> — $99/year
- Individual enrollment: requires a government ID; approval usually 24–48h, sometimes longer.
- **Do this early.** It's the longest-lead-time item in the whole project and it blocks TestFlight.
- You can enroll entirely from Windows/web. Apple's Developer app is nicer but not required.

### 3.3 Week 2: first development build

`eas.json`:
```json
{
  "cli": { "version": ">= 12.0.0", "appVersionSource": "remote" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": false }
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview",
      "ios": { "resourceClass": "m-medium" }
    },
    "production": {
      "channel": "production",
      "autoIncrement": true
    }
  },
  "submit": { "production": {} }
}
```

Register your iPad, then build:
```bash
eas device:create
```
```bash
eas build --profile development --platform ios
```

EAS handles certificates and provisioning profiles for you — say yes when it offers to manage
credentials. It logs into Apple with your credentials, creates everything, and stores it encrypted.
The build runs on EAS's macOS machines. You get an install QR code when it finishes (~15–25 min).

### 3.4 Week 3+: TestFlight, and your daily driver

```bash
eas build --profile production --platform ios
```
```bash
eas submit --platform ios --latest
```

Then in App Store Connect → TestFlight → add yourself as an **Internal Tester** (up to 100 people,
**no App Review required** for internal builds — this is the key detail). The build appears in the
TestFlight app on your iPad within ~10 minutes.

**From here on, updating the app on your iPad is two commands from PowerShell.** And most updates
don't even need that:

```bash
eas update --branch production --message "tweak next-action weights"
```

EAS Update pushes JS-only changes over-the-air in seconds, no rebuild, no resubmission. You only
need a full build when native dependencies change. For an app you're iterating on daily, this is
the difference between shipping and not.

### 3.5 Build economics

Expo's free tier includes **15 iOS builds/month**. That's enough if you use EAS Update for JS
changes and reserve real builds for native changes. If you blow through it, the Production plan is
$99/month — but you almost certainly won't as a solo dev. See [08-free-tier-stack.md](08-free-tier-stack.md)
for the fully-free GitHub Actions alternative.

---

## 4. App Store submission — the health-data gauntlet

Rudder's P4 pillar (medication + mood) puts it under Apple's health rules. Plan for this from the
start; retrofitting it is painful.

### 4.1 Guideline 1.4.1 — Medical apps

Medical apps face heightened scrutiny, must disclose data and methodology behind any accuracy claim,
and must remind users to consult a doctor.

**How Rudder complies:**
- ✅ Makes **no** accuracy or efficacy claims anywhere — App Store description included.
- ✅ Does **not** diagnose, and says so.
- ✅ Does **not** recommend, calculate, or adjust doses. `dose_text` is free text the user typed
  (see [03-data-model.md](03-data-model.md) §2).
- ✅ Every analytics view carries a persistent, non-dismissible disclaimer (FR-4.4).
- ✅ Onboarding includes an explicit "this is a log, not medical advice" acknowledgement.
- ❌ **Never** ship drug-interaction checking. That is a regulated clinical function.

### 4.2 Guideline 5.1.3 — Health & health research

Health/fitness/medical data may not be used for advertising, marketing, or use-based data mining,
and **personal health information must not be stored in iCloud**.

**How Rudder complies:**
- ✅ Zero advertising SDKs, ever.
- ✅ PostHog receives event *names* only, never med names, task titles, or check-in values (NFR-9).
- ✅ Health data lives in Supabase Postgres. **Local SQLite must be excluded from iCloud backup** —
  set `NSURLIsExcludedFromBackupKey` on the DB file, or store it in a non-backed-up directory.
  This is a real, easy-to-miss violation.
- ✅ Sentry `beforeSend` scrubs all health fields, enforced by a unit test.

### 4.3 Also required

| Item | Notes |
|---|---|
| **Privacy Policy URL** | Mandatory. Host on the free Cloudflare Pages marketing site. |
| **Privacy Nutrition Label** | Declare: Health & Fitness, User Content, Identifiers. All marked "not linked to advertising". |
| **Sign in with Apple** | Required if you offer any other third-party sign-in (Guideline 4.8). Magic-link email alone doesn't trigger it, but include Apple anyway — it's what iPad users expect. |
| **Account deletion in-app** | Mandatory since 2022. Settings → Delete Account, must actually delete (30-day purge, [01-prd.md](01-prd.md) NFR-11). |
| **Age rating** | Likely 12+ (medical/treatment info references). |
| **Data export** | Not strictly required by Apple, but required by GDPR if you ever have an EU user. Build it (FR-0.3). |
| **Demo account** | Reviewers need working credentials in App Review notes, pre-populated with sample meds and tasks. |
| **App name** | Check availability in App Store Connect + USPTO before you print it on anything. |

### 4.4 Rejection risks, ranked

1. **Health disclaimer missing or too subtle** on a chart view → most likely rejection. Make it
   impossible to miss.
2. **Guideline 4.2 "minimum functionality"** if you submit before enough is built. Submit with all
   four pillars, not a task list.
3. **Sign in with Apple missing** alongside another social login.
4. **Account deletion buried** or non-functional.
5. **Screenshots showing real medical data** — use obviously fictional demo data.

---

## 5. Path B — EAS internal distribution (ad-hoc), no TestFlight

If you want a build that isn't tied to TestFlight's 90-day window:

```bash
eas device:create
```
Opens a registration URL/QR — open it on the iPad, install the profile, UDID is registered.

```bash
eas build --profile preview --platform ios
```

You get a shareable install link. Ad-hoc provisioning profiles last **365 days**. Only registered
devices can install (100 device slots per year per device type).

Re-sign an existing IPA for a newly-added device without a full rebuild:
```bash
eas build:resign --platform ios
```

Still needs the $99 account. It's TestFlight without the review-adjacent workflow — useful if you
add family members as testers on hardware you control.

---

## 6. Path C — SideStore (the genuinely free path)

Use this **only** if you're not paying the $99. You asked specifically about this, so here it is
honestly, including the parts that are currently rough.

### 6.1 What you get with a free Apple ID

| Limit | Value |
|---|---|
| App expiry | **7 days**, then it stops launching until refreshed |
| Simultaneous sideloaded apps | **3** (SideStore itself counts as one → you get 2) |
| New app IDs per week | 10 |
| Cost | $0 |

A paid developer account removes the app limit and extends expiry to 365 days — but if you're
paying, use TestFlight instead.

### 6.2 What you need

1. A **Windows PC** (you have one) for the initial install.
2. An **unsigned or ad-hoc `.ipa`** of Rudder. From Windows, the free route is a GitHub Actions
   macOS runner producing an unsigned IPA — see [08-free-tier-stack.md](08-free-tier-stack.md) §5.
3. A **pairing file** for the iPad — generated with `iDevicePair` or Jitterbug.
4. **StosVPN** on the iPad. SideStore uses a purely local VPN tunnel to make iOS believe a computer
   is attached, so it can refresh apps on-device without a PC.

### 6.3 Install outline

1. Install iTunes (Apple's own, not the Microsoft Store version) on Windows for the USB drivers.
2. Generate the pairing file, transfer it to the iPad.
3. Install SideStore itself onto the iPad via the desktop SideStore installer, signing with your
   free Apple ID.
4. Install StosVPN on the iPad and enable it.
5. Open SideStore → **refresh SideStore itself first** (this is required — it fixes the app's
   groupID configuration and people skip it and then wonder why nothing works).
6. Sideload `rudder.ipa` through SideStore.
7. Open SideStore roughly weekly to refresh, or leave background refresh enabled.

### 6.4 The honest state of this in 2026

- **StosVPN was removed from the App Store.** If it's already installed on the device it keeps
  working; if not, you're relying on alternative distribution or an older backup. This is the single
  biggest fragility in the whole path.
- Pairing files expire and go stale, requiring regeneration.
- The 7-day cycle means a week away from the PC can leave you unable to open your own app.
- Apple periodically changes free-account signing behaviour; sideloading tooling breaks and gets
  patched on its own schedule.

**Bottom line:** SideStore is a real, working, $0 path and people use it daily. But for an app you
intend to rely on *for executive function* — the one category where "it randomly stopped opening"
is maximally destructive — a 7-day expiry is a bad property. $99/year is $8.25/month for TestFlight
plus the ability to actually ship. That's the call I'd make.

- SideStore docs: <https://docs.sidestore.io/docs/faq>

---

## 7. Windows-specific gotchas

| Gotcha | Fix |
|---|---|
| Long-path errors with `node_modules` | `git config --system core.longpaths true`; enable Win32 long paths in Group Policy |
| Line endings mangling shell scripts in EAS builds | `.gitattributes` with `* text=auto eol=lf` |
| `expo prebuild` generates an `ios/` folder you can't open | Correct and fine — you never open Xcode. Commit it or keep it gitignored and let EAS generate it; pick one and be consistent |
| Docker Desktop needed for local Supabase | Enable WSL2 backend; it's the smoothest path |
| Case-sensitivity bugs | Windows filesystem is case-insensitive, EAS's macOS runners are effectively case-sensitive. `import Button from './button'` works locally and breaks in CI. Turn on ESLint's `import/no-unresolved` with case checking |

---

## 8. Timeline to "running on my iPad"

| When | Milestone | Requires |
|---|---|---|
| Day 1 | App runs on iPad via Expo Go | Nothing |
| Day 1 | Enroll in Apple Developer Program | $99, ID verification |
| Day 2–4 | Enrollment approved | Waiting on Apple |
| Week 2 | First dev build installed | EAS credentials set up |
| Week 3 | TestFlight build on your iPad | App Store Connect app record |
| Week 3+ | OTA updates in seconds | `eas update` |
| ~Week 20 | App Store submission | All four pillars + §4 compliance |
