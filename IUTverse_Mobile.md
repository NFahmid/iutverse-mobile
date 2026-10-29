# IUTverse Mobile — Separate Repository Amendments

**Applies to:** `IUTverse_Mobile_Detailed_Phased_Development_Plan.md` (v1.0)

**Decision:** Keep `iutverse` (existing Next.js web \+ API/backend) and create `iutverse-mobile` (Expo/React Native, Android \+ iOS). Keep the same Supabase project per environment and existing backend. These are targeted amendments; all other phases and feature checklists remain valid.

**Status (2026-10-29):** ~~struck-through~~ items are completed. Sections A and B are done as documentation; the Phase 0.3 exit gate (G0) still waits on the manual steps in `docs/manual-setup.md`. Section C (Phase 1.1) is next: Stage 0 investigation is complete and the implementation plan awaits approval.

## ~~A. Replace the architecture decisions section~~ ✅ done

1. ~~**Two repositories:** `iutverse` owns web, API routes, controllers, services, DB migrations and deployment. `iutverse-mobile` owns Expo, React Native, TypeScript, mobile UI, mobile integration tests and EAS builds.~~
2. ~~**One logical backend:** Web, Android and iOS use the existing Next.js API, Supabase Auth, PostgreSQL, Storage and authorized Realtime.~~
3. ~~**API-first contracts:** Backend publishes a versioned OpenAPI specification. Mobile pins a contract version and generates a TypeScript client using `openapi-typescript` or Orval (choose one after a spike).~~
4. ~~**No cross-repository source imports:** Never import Next.js/server-only code into the mobile app. Share contracts through generated artifacts or a published package only if justified.~~
5. ~~**Platform-specific auth:** Web keeps browser session behavior; mobile uses Supabase Auth with secure storage and native OAuth PKCE/deep links.~~
6. ~~**Independent releases:** Backend deployments remain backward-compatible with supported mobile versions. Mobile has its own CI/CD and store release cadence.~~
7. ~~**Security:** Backend enforces permissions; client platform/version headers are diagnostic, never trusted for authorization. No service-role key in mobile.~~
8. ~~**Notifications:** Preserve the durable event/outbox \+ worker approach and Expo Notifications.~~

## ~~B. Replace Phase 0.3 — Governance and repository boundaries~~ ✅ docs done, G0 pending manual steps

### ~~0.3 Separate-repository architecture and coordination~~

- [x] ~~Create ADR describing repository ownership, shared backend, and rationale for separation.~~
- [x] ~~Define backend API contract ownership and mobile generated-client ownership.~~
- [x] ~~Define API versioning, minimum supported app version and deprecation policy.~~
- [x] ~~Establish cross-repo issue linking and PR dependency conventions.~~
- [x] ~~Document independent staging/production credentials and secrets management.~~
- [x] ~~Define release tagging, branch protections, CI/CD ownership and incident contacts.~~
- [ ] Prepare staging backend reachable from physical devices and representative test accounts. **(manual, still open: `docs/manual-setup.md` M7)**

**Deliverables:** ~~Architecture ADR, ownership matrix, API compatibility policy, cross-repo contribution guide.~~ ✅ (see `docs/`)

**Exit gate:** G0 approved; teams can identify where every change belongs. **(pending: manual items M2, M5, M7 in `docs/manual-setup.md`)**

## C. Replace Phase 1.1 — Backend API contracts

**Status (2026-10-29):** implemented and passing locally in both repositories (uncommitted). Gate G1 is not declared passed. Evidence, blockers and manual steps: `docs/phase-c-progress.md`, `docs/manual-setup.md` (M15 to M21).

### 1.1 Versioned API specification and mobile client generation

**In `iutverse`:**

- [x] ~~Inventory P0/P1 endpoints, request/response DTOs, authorization, pagination, errors, uploads and realtime behavior.~~ ✅ _(all 130 operations inventoried; request/response bodies typed for P0 only, P1 bodies are `inferred`)_
- [x] ~~Create an OpenAPI 3.x specification, preferably generated from authoritative schema definitions where practical.~~ ✅ _(OpenAPI 3.0.3, hand-maintained sources guarded by tests; not generated from code because the server has no schema layer)_
- [ ] Standardize response/error envelopes, timestamp formatting, nullability and stable identifiers. **(partial: conventions documented and request id + auth error `code` added; envelope/pagination unification deferred to a contract MAJOR)**
- [ ] Publish a **versioned OpenAPI artifact** from backend CI (release asset, package or artifact endpoint). **(implemented in `contract.yml`, not yet run on GitHub; no release published)**
- [ ] Validate specification and check for breaking contract changes in CI. **(spec validation done locally; `oasdiff` breaking-change check configured but not executed)**
- [x] ~~Introduce `/api/v1` only where useful; keep current `/api` endpoints functional during migration.~~ ✅ _(decided: no `/api/v1` now; `/api` unchanged)_
- [ ] Add contract tests against existing web clients and representative mobile clients. **(partial: spec-vs-routes and handler-conformance tests done; no web-client compatibility test yet)**

**In `iutverse-mobile`:**

- [ ] Pin the OpenAPI artifact version or backend commit SHA. **(pinned, but PROVISIONAL: no release exists yet)**
- [x] ~~Generate typed API client with `openapi-typescript` or Orval; document the generator and regeneration command.~~ ✅ _(openapi-typescript + openapi-fetch; `docs/api-contract.md`)_
- [x] ~~Wrap generated calls with bearer-token injection, absolute base URL, request IDs, timeouts, cancellation and typed errors.~~ ✅ _(`src/services/api`; 65 offline tests)_
- [ ] Add CI drift detection for generated types and integration smoke tests against staging. **(drift detection done; smoke harness passed 5/5 against the local Docker backend, staging run still open)**

**Deliverables:** OpenAPI contract, generated client, cross-repo contract CI.

**Exit gate:** G1; mobile reads a protected endpoint with generated types and web regressions remain green. **(not yet passed: see `docs/phase-c-progress.md`)**

## D. Replace Phase 1.2 — Cross-platform API transport

**Status (2026-10-29):** implemented and verified in Node and against the backend's local Docker stack (uncommitted in both repositories). Gate D1 is **not** passed: no device, staging or Expo app exists yet. Evidence and findings: `docs/phase-d-progress.md`.

- [x] ~~Keep existing browser-relative `/api` behavior stable for web.~~ ✅ _(no web route or response changed; backend suite 461/461 passes)_
- [x] ~~Define an absolute HTTPS API base URL for Android/iOS.~~ ✅ _(`normalizeBaseUrl` + docs/api-transport.md; runtime check on devices still open)_
- [x] ~~Return mobile-safe absolute media URLs or explicitly document resolution rules.~~ ✅ _(public URLs are already absolute; rules and `resolveMedia` documented/tested; docs/media-and-uploads.md)_
- [ ] Support native multipart/signed uploads, signed downloads, expiration and retries. **(implemented and verified in Node and against the Docker backend; the native uploader adapter and React Native runtime are not done)**
- [x] ~~Add optional `X-Client-Platform` and `X-Client-Version` for observability.~~ ✅ _(backend parse/log + mobile send, tested both sides)_
- [x] ~~Specify idempotency for message sends and other retry-prone mutations.~~ ✅ _(`Idempotency-Key` on messages, posts, comments; migration + tests; verified live under concurrency)_
- [ ] Test auth, uploads, redirects and API access on physical devices; `localhost` on a phone is not the developer computer. **(BLOCKED: no Expo app, staging or device; procedure in docs/device-testing.md)**

**Deliverables:** Transport specification, upload contract, staging device test evidence.

**Exit gate:** Existing web and mobile clients execute equivalent authorized operations. **(D1 BLOCKED: physical-device verification is missing; see `docs/phase-d-progress.md`)**

## E. Replace all Phase 2 subphases — Independent mobile bootstrap

### 2.1 New Expo repository

- [ ] Create `iutverse-mobile` repository with README linking to `iutverse`.  
- [ ] Initialize Expo Router, React Native, TypeScript and strict type checking.  
- [ ] Set Android package ID, iOS bundle ID, development/staging/production variants and `app.config.ts`.  
- [ ] Configure `eas.json`, EAS development builds and native permissions.  
- [ ] Add `.env.example`, safe public Supabase settings, backend URL configuration and secret handling.  
- [ ] Set up ESLint, formatting, GitHub Actions, branch protection and dependency checks.  
- [ ] Validate app startup on Android and iOS; document LAN/tunnel/staging connectivity.

**Deliverables:** Runnable separate mobile repository, independent CI, development builds.

**Exit gate:** App launches and reaches the staging API on both platforms.

### 2.2 Mobile service and API integration layer

- [ ] Add `src/services/api/generated/` for generated client artifacts.  
- [ ] Add `src/services/api/client.ts` for token provider, base URL, retries and error normalization.  
- [ ] Add `src/services/auth/` with Supabase mobile client and SecureStore-backed session persistence.  
- [ ] Add `src/services/realtime/` with authorized subscriptions and reconnection logic.  
- [ ] Define TanStack Query keys, invalidation, pagination and optimistic update conventions.  
- [ ] Implement a vertical slice: login → `/api/auth/me` → protected feed endpoint → render real data.  
- [ ] Pin contract version and run staging integration tests in mobile CI.  
- [ ] **Do not** restructure existing Next.js code into `apps/web` or copy backend internals into mobile.

**Deliverables:** Authenticated generated API client, service adapters, working vertical slice.

**Exit gate:** Same user account and feed data work on web and mobile.

### 2.3 Native UI kit and navigation

- [ ] Create mobile-specific design tokens, light/dark themes and accessible components.  
- [ ] Implement Expo Router tab/stack navigation, auth guards and deep-link route definitions.  
- [ ] Build Home, Explore, Create, Chats and Profile shells.  
- [ ] Add safe-area handling, keyboard avoidance, skeletons, error boundaries and network state.  
- [ ] Test Android/iOS app lifecycle, navigation and screen reader basics.

**Deliverables:** UI primitives, navigation shell, error handling.

**Exit gate:** G2; mobile shell authenticated against the existing backend.

## F. Amend Phase 8.1 — Tests and CI

Add:

- [ ] Backend CI validates OpenAPI and detects incompatible changes against supported mobile contract versions.  
- [ ] Mobile CI checks that generated client matches its pinned OpenAPI version.  
- [ ] Run cross-repository staging smoke tests after backend deploys and before mobile releases.  
- [ ] Test compatibility with the oldest supported installed mobile version, not only latest.  
- [ ] Link contract test evidence and release dependencies between repositories.

## G. Amend Phase 9.2 — Release sequence

1. Deploy **backward-compatible** backend/schema changes from `iutverse` first.  
2. Verify production smoke tests and compatibility with currently released mobile binaries.  
3. Build signed Android/iOS releases from `iutverse-mobile` using EAS.  
4. Distribute through Play Console and TestFlight/App Store Connect with staged rollout.  
5. Monitor API latency, version headers, auth failures, crashes, messaging, media and push delivery.  
6. Preserve deprecated contract fields/routes through the documented support window. Use feature flags or server rollback for urgent incidents; store binary rollback is not immediate.

## H. Replace proposed documentation and repository tree

iutverse/                             \# existing web \+ backend repo

  docs/

    api/

      openapi.yaml                    \# or generated published artifact

      compatibility-policy.md

    mobile-integration/

      auth.md

      uploads.md

      realtime.md

  src/app/api/                        \# existing API routes

  src/server/                         \# existing controllers/services

  supabase/                           \# migrations/config if present

iutverse-mobile/                      \# new Expo repo

  app/                                 \# Expo Router routes

  src/

    components/

    features/

    services/

      api/

        generated/

        client.ts

      auth/

      realtime/

    hooks/

    store/

    types/

    utils/

  assets/

  tests/

  docs/

    architecture.md

    feature-parity-matrix.md

    phase-plan.md

    release-runbook.md

  app.config.ts

  eas.json

  package.json

## I. Replace first-sprint backlog

1. `WEB-API-001` Inventory P0 endpoints and authorization rules.  
2. `WEB-API-002` Produce and validate versioned OpenAPI contract.  
3. `WEB-API-003` Add compatibility checks to backend CI.  
4. `MOB-001` Create Expo repository and independent CI.  
5. `MOB-002` Configure Android/iOS identifiers and EAS development builds.  
6. `MOB-003` Pin API contract and generate TypeScript client.  
7. `MOB-004` Implement secure Supabase mobile auth adapter.  
8. `MOB-005` Implement `/api/auth/me` membership gate.  
9. `MOB-006` Render protected feed data from staging API.  
10. `MOB-007` Verify session restore and networking on Android/iOS.  
11. `INT-001` Cross-repo test: web-created post appears on mobile.  
12. `INT-002` Review vertical slice and approve G2.

## J. Unchanged phases and estimates

**Keep Phases 3–7 and 10** (authentication, feed, chat, campus features, notifications, operations) as written in the original plan. Keep most of Phase 8 and 9, with the additions above. Keep the 16–22 week broad-parity planning range; actual timing depends on team capacity and API-contract maturity.

| Topic | Old approach | New approach |
| :---- | :---- | :---- |
| Repository layout | Monorepo with `apps/web`, `apps/mobile` | Two independent repositories |
| Types and DTOs | Direct workspace imports | Versioned OpenAPI \+ generated client |
| Backend | Existing Next.js API | Unchanged |
| Database/Auth/Storage/Realtime | Supabase | Unchanged |
| Mobile | Expo \+ React Native \+ TypeScript | Unchanged |
| Builds | EAS | Unchanged, independent CI |
| Compatibility | Workspace type checking | Contract validation \+ integration tests |

**Bottom line:** Only architecture/governance, API contracts, Phase 2 bootstrap, CI and release sequencing need material edits. The original feature-by-feature implementation phases still apply.