# API contract (mobile side)

The backend owns the contract; this repo **pins one version of it** and generates TypeScript types from the pin.

| Piece | Where |
|---|---|
| Authoritative source and rules | Backend repo: [`docs/api/`](https://github.com/A-Piyas-04/IUTverse/tree/development/docs/api) (README, conventions, compatibility policy, endpoint inventory, realtime notes) |
| Published versions | Backend GitHub Releases, tag `api-contract-vX.Y.Z`, assets `openapi.yaml`, `openapi.yaml.sha256`, `contract-metadata.json` |
| Pinned copy | [`contracts/openapi.yaml`](../contracts/openapi.yaml) |
| Pin metadata | [`contracts/contract-lock.json`](../contracts/contract-lock.json) (version, source repo/tag/commit, sha256, provisional flag) |
| Generated types | [`src/services/api/generated/schema.d.ts`](../src/services/api/generated/schema.d.ts) (never edit) |
| Hand-written transport | [`src/services/api/`](../src/services/api) (see [api-client.md](api-client.md)) |

## Current pin

Contract **1.0.0**, **provisional**: it was built from the backend's working tree before the version was released, so `contract-lock.json`
has `"provisional": true`, no source commit and no release asset. When the backend merges its contract work and cuts the tag
`api-contract-v1.0.0`, replace the pin with the release (steps below). The sha256 of the published file should equal the
provisional one if the contract did not change in review; if it differs, the diff is the review feedback.

## Generator: openapi-typescript + openapi-fetch

Chosen over Orval because the app uses plain `fetch`, has no data-fetching library yet (TanStack Query conventions are decided in Phase 2.2),
and a types-only generator gives small, reviewable, deterministic output. `openapi-fetch` is a small typed `fetch` wrapper (about 17 kB unminified, no dependencies) whose `fetch`
option lets the handwritten transport own authentication, timeouts, cancellation and errors. Orval's generated hooks would pre-empt the
Phase 2.2 decisions and need a custom mutator for the same transport features. Revisit if the team standardizes on generated query hooks.

Versions are pinned exactly in `package.json` (`openapi-typescript 7.13.0`, `openapi-fetch 0.17.0`) so regeneration is reproducible.

## Commands

| Command | What it does |
|---|---|
| `npm run contract:sync -- <version>` | Downloads release `api-contract-v<version>`, verifies its sha256 and metadata, writes `contracts/openapi.yaml` and `contract-lock.json`. |
| `npm run contract:sync -- --from-file <path to openapi.yaml>` | Provisional pin from a local backend build (marks the lock provisional). |
| `npm run contract:generate` | Regenerates `src/services/api/generated/schema.d.ts` from the pin. |
| `npm run contract:check` | Verifies lock vs file (sha256, version), basic contract sanity, and that the committed generated file equals a fresh generation. |
| `node scripts/contract/check.mjs --require-release` | Same checks, and fails if the pin is provisional. Release builds use it. |

## Upgrading the contract

1. In the backend, confirm the new version is published (`api-contract-v<new>` release) and read its changelog / the compatibility notes.
2. `npm run contract:sync -- <new>`
3. `npm run contract:generate`
4. `npm run typecheck && npm test`. Type errors show exactly which call sites the contract change affects.
5. Commit `contracts/` and `src/services/api/generated/` together with the call-site fixes, and link the backend release in the PR.
6. Before releasing the app, run the staging smoke tests ([staging-smoke-tests.md](staging-smoke-tests.md)).

Never edit `contracts/openapi.yaml` or the generated file by hand: `contract:check` fails if the contract no longer matches its lock or if the generated file differs from a fresh generation.

## Drift detection and CI

`.github/workflows/ci.yml` (job `verify`, required) runs `contract:check`, `typecheck` and the offline tests on every push and pull request.
It does not download anything from the backend: CI consumes the committed pin, never "whatever is newest".

* A nightly `contract-freshness` job compares the pinned version with the latest published backend contract and prints a warning when a newer one exists. It never fails the build.
* A job on `v*` tags runs `check.mjs --require-release`, so a store build cannot ship against a provisional pin.
* Backend-side checks (OpenAPI validity, route-vs-contract tests, breaking-change detection against the last release) run in the backend repo; see its `docs/api/README.md`.

## What the contract does and does not promise

* All 130 backend operations are present. Request/response bodies are fully typed for the P0 set; P1 operations (chat, jobs, events, ...) have
  paths, parameters, auth and status codes, but their bodies are open objects (`inferred`). Types for them tighten as the backend promotes them to
  `reviewed`/`verified`, which is a MINOR contract bump.
* Each operation carries `x-contract-status` (`verified` / `reviewed` / `inferred`) in `contracts/openapi.yaml`; check it before relying on a body shape.
* Realtime events are not in the contract; see the backend's `docs/api/realtime.md`.
* Response shapes are documented as they are (several envelopes, several pagination keys). The generated types therefore differ per operation; do not write code that assumes one global envelope.
