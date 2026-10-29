# Phase D (Phase 1.2) progress: cross-platform API transport

Single progress record for both repositories. Last updated 2026-10-29.

**Overall status: implemented and verified in Node and against the backend's real Docker stack. Exit gate D1 is BLOCKED**
(physical-device verification, staging, and the React Native runtime cannot be exercised yet). D1 is not declared passed.

**Git safety:** no commit, push, tag, release, PR, merge, stash or deployment was made in either repository. All changes are in
the working trees: backend `E:\code\IUTverse\IUTverse` (branch `feat/openapi-contract`, HEAD still `32685e3`, which also still
carries the uncommitted Phase C work) and mobile `E:\code\IUTverse\iutverse-mobile` (branch `development`, HEAD still
`b408b3b`). Nothing was staged.

## Stage checklist

| Stage | Status |
|---|---|
| 1 Transport architecture (web unchanged, absolute base URL, native compatibility review) | Done; RN runtime review is analysis only (assumed, not run) |
| 2 Media URLs and resolution rules | Done (documented rules + `resolveMedia`); no backend response shape changed |
| 3 Native uploads and signed downloads | Done in TypeScript behind a `FileUploader` interface; the native uploader is not written (no Expo) |
| 4 Client platform and version headers | Done (backend parse and log, mobile send) |
| 5 Idempotency | Done for messages, posts and comments, with a database migration |
| 6 OpenAPI and cross-repo contract | Done; mobile pin refreshed locally and still PROVISIONAL |
| 7 Automated tests | Done (below) |
| 8 Physical-device verification | **BLOCKED**; procedure written |
| 9 Documentation | Done |

## Decisions (approved)

| Topic | Decision |
|---|---|
| Idempotency mechanism | Nullable `client_request_id` column with a plain unique index on `(author, client_request_id)` for chat messages, posts and comments. Not a generic response-replay table, because replaying a stored body would serve expired signed URLs; a replay re-reads the row. |
| Signed downloads | Additive `?redirect=false` JSON mode (`{ url, expiresAt }`) on chat attachments and academic files, same authorization. |
| Contract version | Stays 1.0.0 because nothing has been published. |
| Native uploads | Behind a `FileUploader` interface, tested in Node; no Expo application created. |
| Docker | The local stack was rebuilt, used and removed. |
| Media URLs | No backend response change. Public URLs are already absolute; the one relative link (`/api/academic/resources/{id}/file`) is resolved by the app. |

## Findings from the real stack (these changed the design)

| Finding | Consequence |
|---|---|
| The signed upload slot lasted about **1 minute**, not the 2 hours I had assumed. | `expiresAt` is read from the token's own `exp`; the client uploads immediately and replaces a closing slot. |
| `signedUrl` in the upload response used the Docker-internal host (`http://kong:8000`), unreachable from a phone. The web client never noticed because it rebuilds the URL itself. | **Backend bug fixed**: `signedUrl` now goes through `browserUrl()`. Test added. |
| A raw `PUT` of the bytes with a `Content-Type` header is accepted; multipart is not required. | React Native can upload without building a `Blob`/`FormData`. |
| Repeating a completed `PUT` returns **HTTP 400** with body code `KeyAlreadyExists` (also with `x-upsert`). | On a retry this means "already uploaded"; on a first attempt it is an error. |
| Storage accepts any bytes at the `PUT`; the API's claim rejects non-images and deletes the object. | The server stays the validator; documented. |
| An expired or tampered signed download URL returns **HTTP 400** `InvalidJWT`. | The client refreshes through the API once. |
| 8 simultaneous keyed sends created exactly 1 message; 6 keyed posts and 6 keyed comments created 1 each. | The unique index works under real concurrency. |
| **Anonymous posts with an image expose the author's user id** in `imageUrl` and `image`. | **Not fixed** (pre-existing, changes upload ownership). Reported as a security finding; see the report and the backend `media.md`. |
| The Docker stack's per-IP rate limit (Redis-backed, so it survived a restart) produced 429s when I ran many requests from one address. | Reset the local Redis for the test run. It is also evidence for the earlier concern that carriers put many phones behind one IP. |

## Files changed (all uncommitted)

### Backend (`iutverse`)

Modified: `src/server/http/context.ts`, `errors.ts` (PublicError `code`), `route.ts` (client info, error code), `responses.ts`; `src/server/controllers/chatController.ts`
(keyed send, `redirect=false`), `postController.ts`, `commentController.ts` (keyed creates), `communityController.ts` (`redirect=false`);
`src/server/services/chatService.ts` (idempotent delivery), `storageService.ts` (`signedUrlWithExpiry`), `uploadIntentService.ts` (`expiresAt`,
client-facing `signedUrl`); `tests/helpers/stubs.ts` (JWT-shaped upload token); `docs/backend-structure.md`.
(Also still modified from Phase C: `package.json`, `package-lock.json`, `eslint.config.mjs`, `src/server/middleware/auth.ts`.)

New: `src/server/http/clientInfo.ts`, `src/server/http/idempotency.ts`; `supabase/migrations/202610290001_client_request_ids.sql`;
`supabase/tests/client-request-ids.test.sql`; `tests/server/client-info.test.ts`, `idempotency-behavior.test.ts`, `signed-downloads.test.ts`;
`docs/api/idempotency.md`; `docs/mobile-integration/transport.md`, `media.md`; and updates to the contract sources in `docs/api/src/`,
`docs/api/openapi.yaml`, `endpoint-inventory.md`, `conventions.md`, `README.md`, `docs/mobile-integration/uploads.md`.

### Mobile (`iutverse-mobile`)

Modified: `src/services/api/client.ts` (retries, client headers, per-call options), `config.ts` (reject credentials, clearer localhost error),
`errors.ts` (`expired_link`), `index.ts`; `contracts/openapi.yaml`, `contracts/contract-lock.json`, `src/services/api/generated/schema.d.ts` (re-synced,
provisional); `tests/api/client.test.ts`, `tests/helpers/server.ts`.

New: `src/services/api/` `clientInfo.ts`, `idempotency.ts`, `retry.ts`, `media.ts`, `deadline.ts`, `uploads.ts`, `downloads.ts`;
`tests/api/` `retry.test.ts`, `headers.test.ts`, `media.test.ts`, `transfers.test.ts`; `tests/smoke/transport.smoke.test.ts`;
`docs/` `api-transport.md`, `media-and-uploads.md`, `device-testing.md`, `phase-d-progress.md`.

## Verification evidence

Commands run 2026-10-29 on Windows, Node 24.18 (CI uses Node 22).

| Check | Result |
|---|---|
| Backend `npm run contract:check` (lint, bundle, structural, inventory) | PASS, 130 operations, 19 verified |
| Backend `npx tsc --noEmit`, `npm run lint` | PASS, PASS |
| Backend `npm test` (Docker stopped) | PASS: 47 files, 461 tests (was 416: +45 = client-info 9, idempotency 25, signed-downloads 10, one more conformance test) |
| Backend `npm test` while the Docker stack was running | 5 UI timeout failures from CPU contention; they pass with Docker stopped |
| Backend pgTAP, all 9 files incl. the new one, run in the stack's Postgres 17 | PASS: 134 assertions ok, 0 not ok (new file: 12 of 12) |
| Mutation checks (isSameRequest always true; no race recovery in chat; none in comments) | Each caught by tests; source restored |
| Mobile `npm run check` (contract integrity, drift, typecheck, tests) | PASS: 7 files, 202 tests (was 78) |
| Mobile mutation checks (key-less retry; retry 401; honor any key; accept "exists" first try; refresh loop; bearer to storage; skip slot-expiry check) | Each caught by tests; source restored |
| **Live**, local Docker backend, real mobile code: `npm run test:smoke` | PASS: 16 of 16 (5 earlier auth/feed tests + 11 transport tests) |
| Live: upload, claim, public image fetch; bad bytes rejected and deleted; lost PUT response recovered | PASS |
| Live: 8-way concurrent keyed send = 1 message; lost reply to a keyed send retried by the transport = 1 message, `Idempotent-Replayed: true`; reuse with other content = 409; per-member keys; posts and comments | PASS |
| Live: chat attachment upload, send, signed download by both participants, exact bytes; anonymous = 401 | PASS |
| Live: expired signed link (forged with the stack's public demo secret) refreshed once through the API; file delivered | PASS |
| Live: web-style multipart create versus mobile JSON create: same shape, same owner-only protection (403 for the other member on PUT and DELETE) | PASS |
| Physical Android, physical iPhone, Android emulator, iOS simulator | **BLOCKED** (no Expo app, no device) |
| Staging | **BLOCKED** (does not exist) |
| GitHub workflows (`contract.yml`, `ci.yml`), `oasdiff`, published release | **NOT RUN** |
| Browser end-to-end (Playwright) | **NOT RUN** |
| Client headers appearing in a deployed server's logs | **NOT VERIFIED live**: the Docker image runs in production mode where the logger defaults to `warn`; verified by unit tests only |

The Docker containers, volumes, network and the temporary test credentials were removed afterwards. The built and pulled images remain on disk.

## Known limitations

* Everything marked "assumed" in [api-transport.md](api-transport.md) section 4 is unverified on React Native.
* The native uploader/downloader adapters (streaming, real progress) are not written; the default uploader holds a file in memory.
* The contract is still provisional and unpublished; the mobile pin is a local build.
* Only three creates are idempotent. Other creates are not retried by the transport.
* Orphaned uploads are not cleaned up server-side.
* Idempotency keys never expire (they live with the row); a reused old key returns the old resource.
* The retry policy has no total deadline across attempts, only per-attempt timeouts.
* The per-IP rate limit is unchanged and unsuitable for carrier-NAT phones.

## Remaining work

1. Required for D1: build the Expo app (2.1), a React Native `FileUploader`, the session adapter (2.2); stand up staging (M7);
   run [device-testing.md](device-testing.md) on both physical devices.
2. Backend decisions: fix the anonymous-image author leak; add an orphan-upload sweep; consider per-user rate limits.
3. Deployment order: apply the migration, deploy the backend, then ship an app that sends keys.
4. Land and publish both repos' work (Phase C and D), then re-pin the published contract.

## Exit gate D1

See the assessment in the final report; summary: web unchanged PASS (tests), native HTTPS origin PASS (config tests) /
runtime BLOCKED, media PASS (contract, tests, live), native upload PASS in Node and live / BLOCKED on RN, signed downloads PASS
live, headers PASS, idempotency PASS live, contract sync PASS (provisional), web/mobile equivalence PASS live, **physical-device
networking BLOCKED**. D1 is BLOCKED.
