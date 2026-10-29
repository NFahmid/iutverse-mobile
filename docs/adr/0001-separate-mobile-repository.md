# ADR 0001: Separate repository for the mobile app

- **Status:** Proposed (becomes Accepted when gate G0 is approved)
- **Date:** 2026-10-29
- **Deciders:** IUTverse maintainers (see [ownership-matrix.md](../ownership-matrix.md))
- **Applies to:** `A-Piyas-04/IUTverse` (web + API) and `NFahmid/iutverse-mobile` (this repo)

## Context

IUTverse is one Next.js 16 application that serves the web UI and the HTTP API from the same origin. At the time of writing (backend commit `32685e3`, `production` = `development`) it has:

- about 100 Route Handlers under `src/app/api`, wrapped by `route([...steps], handler)` in `src/server/http/route.ts`;
- Supabase for Auth, PostgreSQL (with RLS), Storage and Realtime, with migrations in `supabase/`;
- bearer-token authentication (`Authorization: Bearer <supabase access token>`, validated in `src/server/middleware/auth.ts`), so a native client can call the API without cookies;
- a browser-only CORS allowlist in `src/proxy.ts`; requests without an `Origin` header (native apps) pass through;
- deployment as one Vercel project, built from the `production` branch;
- no OpenAPI document, no `/api/v1` prefix, no push-notification code and no outbox/worker.

We are adding Android and iOS apps (Expo, React Native, TypeScript). The question is whether that code lives inside the existing repository (monorepo) or in a new one.

## Decision

1. **Two repositories.**
   - `iutverse` owns the web app, API routes, controllers, services, database migrations, Supabase configuration and deployment.
   - `iutverse-mobile` owns the Expo app, mobile UI, mobile tests and EAS builds.
2. **One logical backend.** Web, Android and iOS all use the existing Next.js API, Supabase Auth, PostgreSQL, Storage and authorized Realtime. Each environment (staging, production) has one Supabase project shared by all clients.
3. **API-first contracts.** The backend publishes a versioned OpenAPI specification. The mobile repo pins one contract version and generates its TypeScript client from it (`openapi-typescript` or Orval, chosen after a spike in Phase 1.1).
4. **No cross-repository source imports.** Mobile never imports Next.js or server-only code. Types cross the boundary only as generated artifacts, or a published package if that is later justified.
5. **Platform-specific auth.** Web keeps its browser session behavior. Mobile uses Supabase Auth with secure on-device storage and native OAuth with PKCE and deep links.
6. **Independent releases.** Backend deployments stay backward-compatible with supported mobile versions. Mobile has its own CI/CD and store cadence. See [api-compatibility-policy.md](../api-compatibility-policy.md).
7. **Security.** The backend enforces permissions. `X-Client-Platform` and `X-Client-Version` are diagnostic only and never used for authorization. The mobile app never holds the service-role key.
8. **Notifications.** When built (Phase 6), use a durable event/outbox plus worker on the backend and Expo Notifications on the client. Neither exists in the backend today, so this is new work in `iutverse`, not something to "preserve".

## Alternatives considered

| Option | Why not |
|---|---|
| Monorepo (`apps/web`, `apps/mobile`, shared packages) | The backend repo is a single root-level Next.js project with Vercel, Docker and Playwright wired to the root. Moving it to `apps/web` risks the production deploy for no functional gain. Store releases, EAS and native toolchains would share CI, branch rules and permissions with the web. |
| Mobile code inside the Next.js repo (side folder) | Same coupling, and Metro and Next.js tooling would fight over `node_modules`, TypeScript and ESLint config. |
| Wrap the website in a WebView / PWA only | Does not deliver native push, deep-link OAuth, native media capture or store-quality chat. Out of scope of the plan. |

## Consequences

**Positive**
- The web deploy path is untouched.
- Mobile tooling, dependencies and CI evolve at their own pace.
- The API contract becomes explicit and testable, which also benefits web.

**Negative / risks**
- Contract drift between repos. Mitigated by a pinned OpenAPI version, drift detection in both CIs and staging smoke tests ([cross-repo-workflow.md](../cross-repo-workflow.md)).
- Two review queues. Mitigated by issue linking and PR dependency conventions.
- The backend has no OpenAPI spec and its response shapes are not uniform (most endpoints return `{ success, data, message }`, some return their own shape; the web client's `normalize()` hides this). Standardizing is backend work tracked in [backend-handoff.md](../backend-handoff.md).
- Mobile cannot rely on the backend for relative links. Some responses contain `/api/...` paths that the web client resolves in `resolveApiLink`. Phase 1.2 must either make them absolute or document the resolution rule.

## Compliance

- A pull request that imports from `iutverse` source, or vendors backend internals, is rejected.
- A pull request that adds a secret (service-role key, database URL, signing key) to this repo is rejected; see [environments-and-secrets.md](../environments-and-secrets.md).
- Changes that need both repos follow [cross-repo-workflow.md](../cross-repo-workflow.md).
