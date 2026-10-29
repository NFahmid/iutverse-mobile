# Contributing

IUTverse Mobile is the Android and iOS client for [IUTverse](https://github.com/A-Piyas-04/IUTverse). The two repositories are coordinated; read [docs/cross-repo-workflow.md](docs/cross-repo-workflow.md) before opening a PR that touches the API.

## Before you start

1. Check [docs/ownership-matrix.md](docs/ownership-matrix.md) to confirm the change belongs in this repo. API, database and permission changes go to `iutverse`.
2. Open or find an issue. Link the backend issue with its full reference (`A-Piyas-04/IUTverse#123`) when one exists.

## Rules

- Branch from `main`: `feat/...`, `fix/...`, `chore/...`, `docs/...`. Open a PR; `main` is protected.
- Commit messages use Conventional Commits, for example `feat(auth): restore session on launch`.
- Never import from the `iutverse` source tree and never copy backend internals here. Use the generated API client.
- Never commit secrets, keystores, `.env` files or service-role keys. The app bundle is public; see [docs/environments-and-secrets.md](docs/environments-and-secrets.md).
- Do not edit generated API client files by hand; regenerate from the pinned contract.
- A PR that depends on a backend change says `Depends on: A-Piyas-04/IUTverse#<n>` and waits until that change is deployed to staging.
- Permissions are enforced by the backend. UI that hides things by role is a convenience only.

## Checks

Run `npm run check` before opening a PR. It verifies the pinned API contract and generated-client drift (`contract:check`), types (`typecheck`) and the offline tests (`test`). CI (`.github/workflows/ci.yml`) runs the same. Lint and formatting arrive with the Expo project in Phase 2.1.

See [docs/api-contract.md](docs/api-contract.md) to change the pinned contract and [docs/api-client.md](docs/api-client.md) for the transport rules.
