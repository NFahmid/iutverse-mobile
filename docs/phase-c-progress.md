# Phase C (Phase 1.1) progress: versioned API contract and mobile client generation

Single progress record for both repositories. Last updated 2026-10-29.

**Overall status: implemented and passing locally; gate G1 is NOT declared passed** (see the assessment at the end).

Both repositories hold **uncommitted** changes. Nothing was committed, pushed, tagged or published.

* Backend: `E:\code\IUTverse\IUTverse`, local branch `feat/openapi-contract` (cut from `development` at `32685e3`, upstream unset).
* Mobile: `E:\code\IUTverse\iutverse-mobile`, branch `development`.

## Stage checklist

| Stage | Status |
|---|---|
| 0 Investigation and plan (approved) | Done |
| 1 Backend contract foundation | Done |
| 2 Backend contract CI, breaking-change detection, publication, tests | Done locally; CI workflow not yet run on GitHub; `oasdiff` not executed |
| 3 Mobile contract pin and generation | Done; pin is **provisional** |
| 4 Mobile transport | Done |
| 5 Cross-repository verification | Offline done; live run against the local Docker stack passed; staging blocked |
| 6 Final audit and G1 assessment | Done (below) |

## Decisions

| Topic | Decision | Why |
|---|---|---|
| Schema strategy | Hand-maintained OpenAPI 3.0.3 sources (`docs/api/src`), bundled to `docs/api/openapi.yaml`, guarded by tests (hybrid) | The server has no schema layer (hand-written validation, ad hoc responses; no Zod on the server). Introducing one across 130 handlers risks runtime behavior. Tests tie the contract to the route files and to real handler output. |
| Dialect | 3.0.3 | Widest tool support; `nullable`. Revisit 3.1 when the tools are needed. |
| Contract version | `info.version` semver, starts at 1.0.0; release tag `api-contract-vX.Y.Z`; GitHub Release assets with sha256 and metadata | Durable, unauthenticated download for a public repo; Actions artifacts expire and need auth. |
| URL versioning | No `/api/v1` now | Would duplicate 130 routes with no breaking change pending. |
| Runtime changes (approved) | `X-Request-Id` echo (validated, else generated); `code` on auth 401/403 (`AUTH_TOKEN_REQUIRED`, `AUTH_TOKEN_INVALID`, `MEMBERSHIP_REQUIRED`) | Additive; messages and statuses unchanged. Mobile cannot otherwise tell an expired token (403) from a forbidden action. |
| Envelope/pagination unification | Deferred; documented as-is | Changing shapes would break the web client and needs a MAJOR. |
| Generator | `openapi-typescript` 7.13.0 + `openapi-fetch` 0.17.0 | Types-only, fetch-native, no data-fetching library chosen yet. Orval would pre-empt Phase 2.2. |
| Mobile scaffold | Minimal TypeScript/Vitest toolchain, Expo added in Phase 2.1 | No Expo project exists yet; avoids blocking on app identifiers. |
| Retries | None in the transport | Mutations lack idempotency keys (Phase 1.2). |

## Files changed

### Backend (`iutverse`, uncommitted)

Modified: `src/server/http/route.ts` (request id), `src/server/http/responses.ts` and `src/server/middleware/auth.ts` (auth `code`), `package.json` + `package-lock.json` (dev dependencies `@redocly/cli`, `ajv`, `ajv-formats`, `yaml`; `contract:*` scripts), `eslint.config.mjs` (ESM contract scripts), `docs/backend-structure.md` (link).

New:

* `docs/api/`: `README.md`, `conventions.md`, `compatibility-policy.md`, `realtime.md`, `endpoint-inventory.md` (generated), `openapi.yaml` (generated), `redocly.yaml`, `src/openapi.src.yaml`, `src/paths/*.yaml` (15 files), `src/components/{schemas,responses,parameters}.yaml`
* `docs/mobile-integration/auth.md`, `uploads.md`
* `scripts/contract/`: `build.mjs`, `check.mjs`, `gate.mjs`, `inventory.mjs`, `package.mjs`, `spec.mjs`
* `.github/workflows/contract.yml`
* `tests/helpers/contract.ts`, `tests/server/contract-surface.test.ts`, `contract-responses.test.ts`, `contract-gate.test.ts`

### Mobile (`iutverse-mobile`, uncommitted)

* Tooling: `package.json`, `package-lock.json`, `tsconfig.json`, `vitest.config.ts`, `vitest.smoke.config.ts`, `.nvmrc`
* Contract: `contracts/openapi.yaml`, `contracts/contract-lock.json`, `scripts/contract/{lib,sync,check,generate}.mjs`, `src/services/api/generated/schema.d.ts`
* Transport: `src/services/api/{client,errors,config,requestId,index}.ts`, `src/services/api/endpoints/auth.ts`
* Tests: `tests/api/{client,config}.test.ts`, `tests/contract/scripts.test.ts`, `tests/helpers/server.ts`, `tests/smoke/auth-me.smoke.test.ts`
* CI: `.github/workflows/ci.yml`
* Docs: `docs/{api-contract,api-client,staging-smoke-tests,phase-c-progress}.md`; updated `README.md`, `CONTRIBUTING.md`, `docs/{README,phase-plan,backend-handoff,api-compatibility-policy,environments-and-secrets,manual-setup}.md`, `IUTverse_Mobile.md`

## Contract coverage

* 130 operations over 93 paths discovered in `src/app/api`; **130 documented** (a test fails if the sets differ).
* Priority: 32 P0, 85 P1, 13 other. Notifications: no endpoints exist.
* Body schemas: P0 14 verified + 13 reviewed + 5 inferred; P1 and other all inferred (parameters, auth, status codes, body field names; bodies open).
* Not in the contract: Realtime events (documented in `docs/api/realtime.md`), Supabase Auth API, response-shape unification, idempotency keys.

## Verification evidence

Commands run on 2026-10-29 on Windows with Node 24.18 (CI uses Node 22).

| Check | Result |
|---|---|
| Backend `npm run contract:check` (lint, bundle current, structural, inventory current) | PASS: 130 operations, version 1.0.0 |
| Backend `npm run typecheck` | PASS |
| Backend `npm run lint` | PASS (0 warnings) |
| Backend `npm test` | PASS: 44 files, 416 tests (380 tests in 41 files existed before; the three contract test files add 36) |
| Backend contract tests (`contract-surface` 6, `contract-responses` 23, `contract-gate` 7) | PASS |
| Backend `npm run contract:package` | PASS: metadata and sha256 `08c72600…4d04` |
| Backend `node scripts/scanSecrets.js` | PASS, but scans tracked files only; new files were checked by a manual pattern scan (no findings except the check script's own regex) |
| Mobile `npm run check` (contract integrity, generated-client drift, typecheck, tests) | PASS: 3 files, 78 tests |
| Mobile mutation checks on the transport (no timer cleanup, anonymous-call auth leak, first-cause-wins races) | Each mutation was caught by a test; source restored |
| Mobile smoke test without configuration | SKIPPED (5 skipped, reported as skipped); with `SMOKE_REQUIRED=1` it FAILS as designed |
| `oasdiff` breaking-change detection | **BLOCKED**: not executed locally (no npm distribution; I did not run a downloaded binary). Configured in CI via `oasdiff/oasdiff-action` pinned to v0.1.21. The version gate rules that surround it are tested. |
| `.github/workflows/contract.yml` and `ci.yml` on GitHub | **NOT RUN**: parsed as YAML only. Expressions and the `gh release` / `jq` pipeline are unverified on a runner. |
| Staging smoke tests | **BLOCKED**: no staging backend (manual step M7). A live run against the local Docker stack PASSED (below). |
| Release publication and `contract:sync -- 1.0.0` from a real release | **NOT DONE**: the sync logic is tested against a local fake release server (checksum mismatch, wrong version, missing commit, 404). |

## Live verification (backend's local Docker stack)

Run on 2026-10-29 with the user's approval. This is a real backend (Next.js API, Supabase Auth, PostgreSQL, Storage, Realtime, Kong), built from the **uncommitted backend working tree**, so it includes the request id and auth `code` changes. It is not staging and the client was Node, not a device.

How: `docker compose --env-file <empty file> -p iutverse-contract build` then `up -d` (the empty env file keeps the backend's real `.env` out of the stack); a throwaway `@iut-dhaka.edu` member was signed up through Supabase Auth with a generated password; the stack was removed afterwards (`down -v`, so its data is gone) and the temporary credential file deleted. The images remain on disk (M21).

| Check | Result |
|---|---|
| Mobile `SMOKE_REQUIRED=1 npm run test:smoke` against `http://127.0.0.1:8080`: sign in, `GET /api/auth/me` typed as `Me` | PASS |
| Same: `GET /api/feed` through the generated client (6 seeded posts, `totalPosts` 6) | PASS |
| Same: no token -> `unauthorized`, 401, `AUTH_TOKEN_REQUIRED` | PASS |
| Same: invalid token -> `unauthorized`, 403, `AUTH_TOKEN_INVALID` | PASS |
| Same: `X-Request-Id` echoed by the server | PASS |
| One-off script (not committed): 24 real responses validated against `docs/api/openapi.yaml` with Ajv: health, auth/me, auth/validate, profile (3), reference data, feed, posts list/get/create/update/delete, comments create/list/update/replies/delete, react, user lookup, search, upload intent, plus the 401 and 400 error bodies | PASS, 24 of 24 |

Observations: real timestamps look like `2026-10-27T08:23:53.78718+00:00` (variable fractional digits, `+00:00` offset), which is why `conventions.md` tells clients not to assume `Z` or a fixed precision. The write operations (create/update/delete post and comment, react) were only `reviewed`; they conform live, but stay `reviewed` until a repository test pins them. Turning the scratch script into a maintained live-conformance command is a recommended follow-up.


## Known limitations and risks

* The pin is provisional; the recorded `sourceCommit` in the backend's packaged metadata is `32685e3` plus uncommitted work, so it is not a real commit until the PR merges and the tag is cut.
* Conformance tests stub Supabase, so they verify mapping and shape for the fixtures, not database formats (for example timestamp precision). The live run checks some of that.
* P1 request/response bodies are not typed.
* The transport relies on `Request`, `AbortController` and `AbortSignal.timeout` semantics that were verified on Node's `fetch` (undici) only. Hermes/React Native behavior must be checked in Phase 2.1.
* `contract:check` in the backend compares to the last published release only, not every supported version.
* A mobile build relying on `code` or `X-Request-Id` must not ship before the backend change is deployed.

## Remaining work

1. **Required for Phase C:** land the backend PR (M15), tag `api-contract-v1.0.0` (M16), replace the provisional pin, run the `contract` and `ci` workflows on GitHub and fix anything they reveal.
2. **Environment-dependent:** staging backend and smoke run (M7, M19); run `oasdiff` once to prove the guard (M17).
3. **Recommended:** promote more operations from `inferred` to `reviewed`/`verified` as mobile features need them (chat, jobs, search first); multi-version compatibility baselines; web-client compatibility test (`normalize`/`apiPage` against spec examples).
4. **Deferred to Phase 1.2 and later:** absolute media URLs, idempotency keys, upload helpers and retries, client-version logging, per-user rate limits, Supabase session adapter (2.2), TanStack Query conventions, Expo bootstrap (2.1), envelope unification (a contract MAJOR).

## G1 exit gate assessment

Each criterion is judged on its own. **G1 is not declared passed.**

| Criterion | Result | Evidence / gap |
|---|---|---|
| The mobile code reads an existing protected endpoint using generated types | **PASS against a real local backend; BLOCKED for an actual app and for staging** | Live smoke test above. There is no Expo app yet (Phase 2.1) and no staging backend (M7); the evidence is the real transport and generated types running in Node. |
| Authentication and authorization are enforced | **PASS** | Live: 401 without a token, 403 for an invalid token, member required. Backend: existing role-matrix tests plus contract tests (every protected operation answers 401 anonymously), all passing. |
| Existing web functionality remains compatible | **PASS for the server test suite and build; NOT RUN for browser end-to-end** | 416 of 416 backend tests (380 existing + 36 new), typecheck, lint, and `next build` inside the Docker image all succeed. The two runtime changes are additive (an extra header, an extra JSON field on auth errors; messages and statuses unchanged). Playwright e2e was not run. |
| OpenAPI validation passes | **PASS locally; CI NOT RUN** | `contract:check` passes. |
| Generated-client drift detection passes | **PASS locally; CI NOT RUN** | `contract:check` and tooling tests (stale and hand-edited files are rejected). |
| Contract compatibility checks pass | **BLOCKED** | The version gate is implemented and tested. `oasdiff` was not executed and there is no published baseline release to compare with. |
| Tests provide evidence of these outcomes | **Partial** | Listed above. GitHub workflow runs, `oasdiff`, staging and a device are the missing evidence. |

What closes G1: land the backend PR (M15), publish `api-contract-v1.0.0` (M16) and replace the provisional pin, get both workflows green on GitHub, see `oasdiff` fail a deliberately breaking change once (M17), run the smoke tests against staging (M7, M18, M19), and confirm with the maintainers that the Node-based vertical slice is acceptable until the Expo app exists, or repeat the read from the Phase 2.1 app.
