# Getting an .ipa

**Target: unsigned `.ipa`, sideloaded via SideStore with a free Apple ID. Cost: $0.**

## Why it has to work this way

| Attempt | Result |
|---|---|
| `expo prebuild --platform ios` on Windows | ❌ **Impossible.** Requires macOS or Linux — verified, not assumed |
| `eas build --platform ios` (device) | ❌ Requires Apple signing credentials |
| `eas build --local` | ❌ Requires macOS |
| EAS simulator build | ❌ Produces a `.app`, needs a Mac to run it, can't sideload |
| **GitHub Actions `macos-15` runner** | ✅ **This.** Free macOS minutes, unsigned build, `.ipa` artifact |

SideStore re-signs the unsigned `.ipa` with your free Apple ID at install time, which is why no
Apple Developer Program membership is needed to *get the file*.

## Steps

### 1. Change the bundle identifier

[`app.config.ts`](app.config.ts) line 5. `com.rudder.capture` is a placeholder and probably taken.

```ts
const BUNDLE_ID = 'com.yourname.rudder';
```

### 2. Push to GitHub

```bash
git commit -m "Rudder: capture + companion shell"
```

```bash
gh repo create rudder --private --source=. --push
```

Public repos get unlimited free Actions minutes; private repos get 2,000/month. A build takes
roughly 10–20 minutes, so either is fine.

### 3. Run the workflow

GitHub → **Actions** → **Build unsigned IPA** → **Run workflow**.

Or from the terminal:

```bash
gh workflow run ipa.yml
```

Watch it:

```bash
gh run watch
```

### 4. Download and sideload

```bash
gh run download --name rudder-unsigned-ipa
```

That gives you `rudder-unsigned.ipa`. Sideload it with SideStore per
[docs/06-shipping.md](docs/06-shipping.md) §6.

## Known constraints of this path

- **7-day expiry.** Free-Apple-ID signing lasts a week; SideStore refreshes it.
- **2 apps max** (SideStore itself counts toward the limit of 3).
- **StosVPN was pulled from the App Store.** Without it on the device, refreshing needs a PC on the
  same LAN. `docs/06-shipping.md` §6.4 calls this the single biggest fragility in the free path, and
  that assessment still holds.

If the 7-day cycle becomes tiresome, the $99 Apple Developer Program plus TestFlight removes all
three constraints and uses the same codebase — switch the workflow for
`eas build --profile sideload --platform ios`.

## If the build fails

The most likely failure is a config-plugin error surfacing during `expo prebuild`, because that step
has **never run on this machine** — Windows cannot execute it. The macOS runner is the first place
it executes at all. Check the *Generate the native iOS project* step in the Actions log first.
