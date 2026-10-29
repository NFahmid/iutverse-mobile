# IUTverse Mobile

Android and iOS app for [IUTverse](https://github.com/A-Piyas-04/IUTverse), the campus platform for the Islamic University of Technology. Built with Expo, React Native and TypeScript.

## Status

Phase 0 (governance and repository boundaries). There is no app code yet; the Expo project is created in Phase 2.1. See [docs/phase-plan.md](docs/phase-plan.md).

## Two repositories, one backend

| Repo | Owns |
|---|---|
| [`iutverse`](https://github.com/A-Piyas-04/IUTverse) | Web app, Next.js API routes, services, database migrations, Supabase config, deployment |
| `iutverse-mobile` (this repo) | Expo app, mobile UI, mobile tests, EAS builds |

Web and mobile share the same API, Supabase Auth, PostgreSQL, Storage and Realtime. The mobile app talks to the API through a TypeScript client **generated from a pinned OpenAPI contract**; it never imports backend source. Read the reasoning in [ADR 0001](docs/adr/0001-separate-mobile-repository.md).

## Documentation

Start at [docs/README.md](docs/README.md).

- [Architecture](docs/architecture.md)
- [Ownership matrix](docs/ownership-matrix.md): where each change belongs
- [API compatibility policy](docs/api-compatibility-policy.md)
- [Cross-repo workflow](docs/cross-repo-workflow.md)
- [Environments and secrets](docs/environments-and-secrets.md)
- [Manual setup checklist](docs/manual-setup.md)

## Planned layout

```text
app/                 Expo Router routes
src/
  components/  features/  hooks/  store/  types/  utils/
  services/
    api/             generated/ (OpenAPI client) and client.ts
    auth/            Supabase mobile client, SecureStore session
    realtime/        authorized subscriptions
assets/  tests/  docs/
app.config.ts  eas.json  package.json
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
