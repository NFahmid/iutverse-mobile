# IUTverse Mobile

Android and iOS app for [IUTverse](https://github.com/A-Piyas-04/IUTverse), the campus platform for the Islamic University of Technology. Built with Expo, React Native and TypeScript.

## Status

The Expo project itself is created in Phase 2.1 and does not exist yet. What exists today (Phase 1.1, see [docs/phase-c-progress.md](docs/phase-c-progress.md)):

* the **pinned backend API contract** (OpenAPI) and the **TypeScript client generated from it**;
* the **API transport** (bearer token injection, request ids, timeouts, cancellation, typed errors) with offline tests;
* **contract tooling and CI**: sync, integrity check, generated-client drift detection;
* a **live smoke test** harness for a real backend (not yet run against one; see the progress doc).

## Two repositories, one backend

| Repo | Owns |
|---|---|
| [`iutverse`](https://github.com/A-Piyas-04/IUTverse) | Web app, Next.js API routes, services, database migrations, Supabase config, deployment, the API contract |
| `iutverse-mobile` (this repo) | Expo app, mobile UI, mobile tests, EAS builds, the pinned contract copy and generated client |

Web and mobile share the same API, Supabase Auth, PostgreSQL, Storage and Realtime. The mobile app never imports backend source; it talks to the API through a client **generated from a pinned OpenAPI contract**. Read the reasoning in [ADR 0001](docs/adr/0001-separate-mobile-repository.md).

## Commands

Requires Node 22 or newer (`.nvmrc`).

| Command | Purpose |
|---|---|
| `npm ci` | Install dependencies. |
| `npm run check` | Everything CI requires: contract integrity and drift, typecheck, offline tests. |
| `npm run contract:sync -- <version>` | Pin a published backend contract version (see [docs/api-contract.md](docs/api-contract.md)). |
| `npm run contract:generate` | Regenerate `src/services/api/generated/schema.d.ts` from the pin. |
| `npm run test:smoke` | Live tests against a backend; needs `SMOKE_*` variables ([docs/staging-smoke-tests.md](docs/staging-smoke-tests.md)). |

## Using the API client

```ts
import { createApiClient, getCurrentMember } from "./src/services/api";

const api = createApiClient({ baseUrl: "https://<backend origin>", getAccessToken: async () => session?.access_token });
const me = await getCurrentMember(api); // typed from the contract
```

Details, error kinds and rules: [docs/api-client.md](docs/api-client.md).

## Documentation

Start at [docs/README.md](docs/README.md).

- [API contract](docs/api-contract.md) and [API client](docs/api-client.md)
- [Architecture](docs/architecture.md)
- [Ownership matrix](docs/ownership-matrix.md): where each change belongs
- [API compatibility policy](docs/api-compatibility-policy.md)
- [Cross-repo workflow](docs/cross-repo-workflow.md)
- [Environments and secrets](docs/environments-and-secrets.md)
- [Manual setup checklist](docs/manual-setup.md)

## Layout

```text
contracts/           pinned OpenAPI contract + contract-lock.json (do not edit)
scripts/contract/    sync, check and generate tooling
src/services/api/    generated/ (do not edit), client.ts, errors.ts, config.ts, requestId.ts, endpoints/
tests/               offline tests (api, contract tooling) and smoke/ (live)
docs/                architecture, policies, guides
```

The Expo Router app (`app/`), `app.config.ts`, `eas.json` and the rest of `src/` are added in Phase 2.1.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
