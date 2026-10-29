# Ownership matrix

Where every kind of change belongs, and who is accountable. Handles are GitHub accounts. Rows marked **TODO** need a decision from the maintainers; see [manual-setup.md](manual-setup.md).

## Repositories

| Repo | GitHub | Primary owner | Deploys to |
|---|---|---|---|
| `iutverse` (web + API + DB) | [A-Piyas-04/IUTverse](https://github.com/A-Piyas-04/IUTverse) | `@A-Piyas-04` | Vercel (branch `production`), Supabase |
| `iutverse-mobile` (Expo app) | [NFahmid/iutverse-mobile](https://github.com/NFahmid/iutverse-mobile) | `@NFahmid` | EAS builds, Play Console, TestFlight / App Store Connect |

## Where does this change go?

| Change | Repo | Notes |
|---|---|---|
| New or changed API route, request/response field | `iutverse` | Update the OpenAPI spec in the same PR. Follow [api-compatibility-policy.md](api-compatibility-policy.md). |
| Database migration, RLS policy, storage bucket, Supabase hook | `iutverse` | `supabase/migrations`, with pgTAP tests. Backward-compatible (expand, then contract). |
| Authorization rule, role, membership logic | `iutverse` | Mobile never decides permissions. |
| Rate limits, CORS, upload limits | `iutverse` | Mobile requests the change via a `needs-backend` issue. |
| Push-notification events, outbox, worker | `iutverse` | New backend work (Phase 6). |
| Supabase Auth settings: providers, redirect URLs, rate limits | Supabase dashboard (staging and prod) | Backend owner applies; mobile owner supplies the exact URLs. |
| Screens, navigation, native UI, themes, offline cache | `iutverse-mobile` | |
| Generated API client, pinned contract version | `iutverse-mobile` | Regenerate; never hand-edit `generated/`. |
| Deep links, app icons, permissions strings, store listing | `iutverse-mobile` | |
| EAS config, signing credentials, store releases | `iutverse-mobile` | |
| Web-only UI | `iutverse` | |
| Cross-platform behavior (for example "post appears on both") | Both | Tracking issue plus one issue per repo; see [cross-repo-workflow.md](cross-repo-workflow.md). |

## CI/CD ownership

| Pipeline | Repo | Owner | Trigger | Output |
|---|---|---|---|---|
| Backend tests, secret scan, build | `iutverse` | `@A-Piyas-04` | push, PR | Gate for merge |
| OpenAPI validation and breaking-change check | `iutverse` | `@A-Piyas-04` | PR | Gate for merge (Phase 1.1) |
| Publish versioned OpenAPI artifact | `iutverse` | `@A-Piyas-04` | release tag | Release asset (Phase 1.1) |
| Backend deploy | `iutverse` (Vercel) | `@A-Piyas-04` | push to `production` | Production API |
| Lint, typecheck, unit tests, generated-client drift check | `iutverse-mobile` | `@NFahmid` | push, PR | Gate for merge (Phase 2.1) |
| Staging smoke tests | `iutverse-mobile` | `@NFahmid` | PR, nightly, release | Gate for release |
| EAS builds and store submission | `iutverse-mobile` | `@NFahmid` | version tag, manual | Signed binaries |
| Cross-repo compatibility run (oldest supported app vs current backend) | `iutverse-mobile`, triggered after backend deploys | Both | backend deploy, release | Evidence linked on both release PRs |

## Release and branch rules (summary)

Details are in [cross-repo-workflow.md](cross-repo-workflow.md).

- `iutverse-mobile`: trunk `main`, protected; PR-only; app releases tagged `v<major>.<minor>.<patch>`.
- `iutverse`: existing `development` -> `production` flow stays as is; contract releases tagged `api-contract-v<major>.<minor>.<patch>` (Phase 1.1).

## Incident contacts

| Area | Primary | Backup | Channel |
|---|---|---|---|
| Backend / API / database outage | `@A-Piyas-04` | **TODO** | **TODO** (the backend README lists a maintainer contact) |
| Mobile crash, bad release, store issue | `@NFahmid` | **TODO** | **TODO** |
| Security incident (leaked key, account takeover) | `@A-Piyas-04` and `@NFahmid` together | **TODO** | **TODO**; follow `docs/security-credential-rotation.md` in `iutverse` for key rotation |
| Supabase / Vercel account access | **TODO** | **TODO** | **TODO** |

Incident rules of thumb:

1. A store binary cannot be rolled back instantly. Prefer a server-side fix, a feature flag, or a backend rollback, then ship a mobile fix.
2. If a backend deploy breaks a supported mobile version, the backend rolls back first and a compatibility test is added before redeploying.
3. Any exposed secret is rotated first and investigated afterwards.
