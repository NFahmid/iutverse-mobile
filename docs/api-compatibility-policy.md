# API compatibility policy

**The canonical copy now lives in the backend repo:** [`docs/api/compatibility-policy.md`](https://github.com/A-Piyas-04/IUTverse/blob/development/docs/api/compatibility-policy.md)
(on the branch that carries the Phase 1.1 work until it is merged). This page only summarizes what the mobile app depends on, so the two cannot drift.

The numbers are still **proposed defaults** until the maintainers confirm them (gate G0).

## What mobile relies on

* The contract version (`info.version`, semver) is independent of the URL prefix. Routes stay under `/api`; `/api/v1` is introduced only when a breaking change cannot be additive.
* A published contract version is immutable (release `api-contract-vX.Y.Z`). This repo pins exactly one version in `contracts/contract-lock.json` and upgrades by pull request ([api-contract.md](api-contract.md)).
* Breaking changes (removals, type/nullability changes, new required request fields, changed auth or envelopes) need a MAJOR bump and the deprecation process: replacement first, at least two mobile releases, at least 90 days, then removal in a MAJOR version.
* Supported app versions (proposed): releases from the last 90 days and the last two minor releases, whichever is larger. `X-Client-Platform` / `X-Client-Version` are diagnostic only and never used for authorization.
* The backend deploys the backward-compatible change before a mobile build depends on it. The `code` field on authentication errors and the `X-Request-Id` echo exist from contract 1.0.0; a mobile build that relies on them must not ship before that backend version is deployed.

## Verification on this side

* `npm run contract:check`: pin integrity and generated-client drift (CI `verify`).
* Nightly freshness notice when the backend publishes a newer contract.
* Staging smoke tests with the pinned contract ([staging-smoke-tests.md](staging-smoke-tests.md)). Running them with the **oldest supported** contract is a follow-up.
