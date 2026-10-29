# Manual setup checklist

Everything below needs your accounts, dashboards or decisions, so it could not be done from the repo. Do the **Now** items to close Phase 0.3 (gate G0). **Later** items are listed so you can plan; they are needed before Phase 2.1 or the first store release.

Tick the boxes as you go.

## Now (needed for G0)

### M1. Commit and push the documentation

Review the new files, then:

```bash
git add -A
git commit -m "docs: add architecture ADR, ownership, API policy and repo scaffolding"
git push origin main
```

Nothing has been committed for you. `IUTverse_Mobile.md` (the amendments plan) is untracked; either commit it as is, or move it to `docs/` first.

- [ ] Done

### M2. Protect `main` on GitHub

`github.com/NFahmid/iutverse-mobile` -> Settings -> Branches -> Add branch ruleset (or classic rule) for `main`:

1. Require a pull request before merging (0 approvals while you are the only maintainer).
2. Block force pushes and branch deletion; require linear history.
3. Leave "Require status checks" for later. The check names do not exist until CI is added in Phase 2.1; then add them here.

If the repo is private on a free GitHub plan, branch protection is unavailable. Make it public or upgrade, or accept the gap for now and note it in the ADR.

- [ ] Done

### M3. Turn on GitHub security features

Settings -> Code security:

- [ ] Dependabot alerts and Dependabot security updates
- [ ] Secret scanning and push protection

### M4. Create issue labels

Issues -> Labels -> New label, in this repo (and in the backend repo if you have access): `needs-backend`, `needs-mobile`, `contract-change`, `blocked`, `parity`. Meanings are in [cross-repo-workflow.md](cross-repo-workflow.md).

- [ ] Done

### M5. Fill in the TODOs and get G0 approval

1. Open [ownership-matrix.md](ownership-matrix.md) and fill the **TODO** cells: backup contacts, incident channel, who has Supabase/Vercel access.
2. Open [environments-and-secrets.md](environments-and-secrets.md) and fill the staging rows once M7 is done.
3. Share ADR 0001 and the API policy with the backend owner (`@A-Piyas-04`) and agree on the proposed numbers (90-day support window, 2 mobile releases before removal, 2 percent usage threshold). Then change the ADR status from *Proposed* to *Accepted*.

- [ ] Done

### M6. Open the backend issues

You need write access to `A-Piyas-04/IUTverse`, or ask the owner to do it. Create issues from [backend-handoff.md](backend-handoff.md): `WEB-API-001`, `WEB-API-002`, `WEB-API-003`, and one for the docs the plan expects in `docs/api` and `docs/mobile-integration`. Mention that the policy draft is ready to copy.

- [ ] Done

### M7. Prepare a staging backend reachable from phones

Plan item 0.3 (last bullet). The backend owner (or you with their access) must:

1. Create a **separate Supabase project** for staging.
2. From a trusted machine with the staging `DIRECT_URL` in the backend's `.env`: `npm run migrate:supabase`, then `npm run security:bootstrap-roles` (see `docs/vercel-deployment.md` step 2).
3. Create a second Vercel deployment (or a stable Preview alias) of `iutverse` with **Preview-scoped** env variables pointing at the staging Supabase project and its own Redis (`REDIS_URL`). Never reuse production keys.
4. In the staging Supabase project, Authentication -> URL Configuration: set Site URL, and add exact redirect URLs for the app's deep links (see M9 and M10 for the scheme).
5. Enable Google in the staging project if you want to test Google sign-in (`docs/oauth-setup.md`).
6. Check `https://<staging-host>/api/health` returns 200 **from your phone's browser**.
7. Create test accounts (list in [environments-and-secrets.md](environments-and-secrets.md)). Sign-up is limited to `@iut-dhaka.edu`; create other addresses as admin in the Supabase dashboard. Store passwords in a password manager.

- [ ] Staging Supabase project  - [ ] Staging deployment  - [ ] Test accounts  - [ ] Health check from a phone

### M8. Choose the license

The backend README says MIT but the repo has no `LICENSE` file. Decide for this repo (and tell the backend owner). I did not add one because it is a legal choice that is yours to make. GitHub: Add file -> Create new file -> name it `LICENSE` -> "Choose a license template".

- [ ] Done

## Later (before Phase 2.1 / first release)

### M9. Choose permanent app identifiers

Pick an Android `applicationId` and iOS bundle identifier that you control, for example `<reverse-domain>.iutverse`. They are effectively permanent once published. Proposed variants:

| Variant | Identifier | URL scheme |
|---|---|---|
| development | `<id>.dev` | `iutverse-dev` |
| staging | `<id>.staging` | `iutverse-staging` |
| production | `<id>` | `iutverse` |

Tell me the base identifier and I will wire it into `app.config.ts` in Phase 2.1.

- [ ] Decided: `________________`

### M10. Register deep-link redirect URLs in Supabase

For **each** Supabase project (staging, production), Authentication -> URL Configuration -> Redirect URLs, add exact URLs (no wildcards), for example `iutverse://auth/callback` and `iutverse://reset-password` for production, and the `-staging` scheme variants for staging. Final paths are confirmed when auth is built in Phase 2.2 and Phase 3.

- [ ] Staging  - [ ] Production

### M11. Developer accounts

- [ ] **Expo account** (expo.dev) for EAS; create an access token (Account settings -> Access tokens) and keep it for CI as `EXPO_TOKEN`.
- [ ] **Apple Developer Program** (paid, yearly) for TestFlight and the App Store. Needed for installing development builds on a physical iPhone too. An organization account needs a D-U-N-S number and takes longer; decide individual vs organization early.
- [ ] **Google Play Console** (one-time fee, identity verification). New personal accounts may need a closed test with a minimum number of testers before production access; check the current Play Console rules when you register.
- [ ] **Firebase project** for FCM (Android push), later in Phase 6.

### M12. Developer machine

Detected here: Node v24.18.0, npm 11.16.0, no GitHub CLI. The backend pins Node 22.x. Use Node 22 LTS for parity (for example with nvm-windows or Volta); Expo supports it.

- [ ] Android Studio with an emulator, and a physical Android phone with USB debugging
- [ ] iOS: simulators need a Mac with Xcode. Without a Mac you can still build iOS development builds in the cloud with EAS and install them on a registered iPhone.
- [ ] Optional: GitHub CLI (`winget install GitHub.cli`) for scripting issues and labels

### M13. GitHub secrets for mobile CI

When Phase 2.1 adds workflows, Settings -> Secrets and variables -> Actions on this repo: `EXPO_TOKEN`, staging API URL and anon key (as variables), staging test-account credentials (as secrets). Never add service-role keys or database URLs.

- [ ] Done (after Phase 2.1)

### M14. Backend settings to review with the owner

- Per-IP rate limits and mobile carrier NAT (see [architecture.md](architecture.md), last table).
- Supabase Auth rate limits for sign-in, sign-up and reset.
- Confirm the backend PR target branch (`development` is assumed).

- [ ] Done

## What I need from you to continue

1. The base app identifier (M9).
2. Confirmation of the policy numbers (M5) or your preferred values.
3. Staging URL and Supabase project URL when M7 is done (public values only; never paste keys into chat).
4. Go-ahead for Phase 2.1 (Expo bootstrap), which this setup deliberately does not start.
