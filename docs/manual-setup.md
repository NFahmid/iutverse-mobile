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

## Phase C (API contract) manual steps

The Phase 1.1 work exists as **uncommitted** changes in both repositories. Nothing was committed, pushed or published.

### M15. Review and land the backend changes

Local checkout `E:codeIUTverseIUTverse`, branch `feat/openapi-contract` (cut from `development`; its upstream was deliberately unset so a plain `git push` cannot reach `development`). Check `git status` and `git diff`, then commit in whatever grouping you like, push the branch to a fork or to `A-Piyas-04/IUTverse` (you need write access, or ask the owner) and open a PR into `development`. The new workflow `.github/workflows/contract.yml` runs on that PR; read its result before merging.

- [ ] Reviewed  - [ ] PR opened  - [ ] `contract` and `security` workflows green

### M16. Publish contract 1.0.0

After the backend PR is merged and deployed, a maintainer creates the tag on the merge commit (on `development` or `production`):

```bash
git tag api-contract-v1.0.0 <merge commit sha>
git push origin api-contract-v1.0.0
```

The `publish` job creates the GitHub Release with `openapi.yaml`, `openapi.yaml.sha256` and `contract-metadata.json`. Check that the release exists, then in this repo:

```bash
npm run contract:sync -- 1.0.0
npm run contract:generate
npm run check
```

Commit `contracts/` and `src/services/api/generated/`. The sha256 should equal the provisional pin's; if it does not, the contract changed in review and the diff shows how.

- [ ] Tag pushed  - [ ] Release exists  - [ ] Mobile pin replaced (no longer provisional)

### M17. Run `oasdiff` once yourself (optional but recommended)

Breaking-change detection runs in the backend CI through the pinned `oasdiff-action`. It could not be run here. After the first release, open a PR that removes a field and confirm the `compatibility` job fails, to prove the guard works.

- [ ] Done

### M18. Deploy the backend change before relying on it

The mobile client classifies an expired token by the new `code` field and correlates logs by `X-Request-Id`. Both only exist after the backend branch is deployed. Deploy it to staging (M7) before running the staging smoke tests, and to production before a store build.

- [ ] Staging  - [ ] Production

### M19. Enable the staging smoke job

In this repo: Settings -> Secrets and variables -> Actions. Variables: `SMOKE_API_BASE_URL`, `SMOKE_SUPABASE_URL`, `SMOKE_SUPABASE_ANON_KEY`. Secrets: `SMOKE_EMAIL`, `SMOKE_PASSWORD` for a dedicated non-production member. Until then the job is skipped and prints a notice. Details: [staging-smoke-tests.md](staging-smoke-tests.md).

- [ ] Done

### M20. Branch protection with the new checks

Once the workflows have run at least once, add the check names to the `main` rule here (`verify`) and to the backend's `development`/`production` rules (`validate`, `compatibility`, plus the existing `secrets`, `app`, `database`). Do not require `staging-smoke`.

- [ ] Done

### M21. Clean up the local Docker stack

The live check used the Compose project name `iutverse-contract`. Its containers, network and volumes (including the throwaway test member) were already removed with `down -v`. The built and pulled images remain on disk (several GB). To reclaim the space:

```bash
docker image rm iutverse-contract-web iutverse-contract-migrate
```

The pulled Supabase and Redis images can be removed with `docker image prune -a` (this removes every unused image on the machine, so check `docker images` first). To run the stack again, use an empty `--env-file` so the backend's real `.env` is not read for variable substitution.

- [ ] Done

## What I need from you to continue

1. The base app identifier (M9).
2. Confirmation of the policy numbers (M5) or your preferred values.
3. Staging URL and Supabase project URL when M7 is done (public values only; never paste keys into chat).
4. Go-ahead for Phase 2.1 (Expo bootstrap), which this setup deliberately does not start.
5. Review of the Phase C changes (M15) and the tag for contract 1.0.0 (M16).
