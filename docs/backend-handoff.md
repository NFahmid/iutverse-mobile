# Backend hand-off (work that belongs in `iutverse`)

The phase 0 and 1 plan puts several deliverables in the backend repo. This file lists them, with what the current backend (commit `32685e3`) already has, so they can be opened as issues in [A-Piyas-04/IUTverse](https://github.com/A-Piyas-04/IUTverse). Nothing here has been changed in that repo.

## Files the plan expects in `iutverse`

| Path (in `iutverse`) | Content | Starting point |
|---|---|---|
| `docs/api/openapi.yaml` (or generated artifact) | OpenAPI 3.x for P0/P1 endpoints | None exists. `docs/backend-structure.md` has the endpoint table; `tests/server/api-surface.test.ts` pins the route list; `src/lib/types.ts` (client DTOs) and `src/server/utils/validation.ts` can seed schemas. Server validation is hand-written, not Zod, so a generated-from-schema spec needs a decision. |
| `docs/api/compatibility-policy.md` | Versioning, support window, deprecation | Copy [api-compatibility-policy.md](api-compatibility-policy.md) after review. |
| `docs/mobile-integration/auth.md` | Bearer-token use, `/api/auth/me` membership gate, OAuth PKCE redirect URLs, token refresh | See notes below. |
| `docs/mobile-integration/uploads.md` | Signed upload flow, size/type limits, `uploadPath` | `POST /api/uploads`, `docs/vercel-deployment.md`, `docs/messaging.md` (10 MB images/PDF, 50 MB video). |
| `docs/mobile-integration/realtime.md` | Which tables mobile subscribes to and the RLS that authorizes them | `docs/messaging.md` (Realtime section), `supabase/migrations/202610240001_chat_messaging.sql`. |

## Backlog items (from the plan)

| ID | Task | Notes from the analysis |
|---|---|---|
| `WEB-API-001` | Inventory P0 endpoints and authorization rules | About 100 routes under `src/app/api`. Authorization steps are visible in each `route([...])` call. P0 for mobile: auth, profile, feed/posts/comments, chat, search, uploads. |
| `WEB-API-002` | Produce and validate a versioned OpenAPI contract | Normalize envelopes: most routes use `success()/created()/failure()` (`{ success, data, message }`), others use `json(status, body)` with custom shapes. Document both, then converge. |
| `WEB-API-003` | Add compatibility checks to backend CI | Existing workflow is `.github/workflows/security.yml` (gitleaks + app tests). Add spec lint and a breaking-change diff job. |
| (Phase 1.2) | Absolute media URLs | Some payload links are relative `/api/...`; web resolves them in `src/lib/api.ts`. Return absolute URLs or document resolution. |
| (Phase 1.2) | Idempotency for message send and uploads | Not present today. |
| (Phase 1.2) | Optional `X-Client-Platform` / `X-Client-Version` logging | Log in `src/server/http/route.ts` request logging; never use for authz. |
| (Phase 1.2) | Rate-limit review for mobile | Limits are per IP (`src/server/http/rateLimit.ts`). Mobile carriers share IPs; consider per-user buckets on authenticated routes. |
| (Phase 6) | Notification events, outbox, worker, push token registration | Does not exist. New backend feature. |
| (Policy) | Minimum supported app version setting | New; see [api-compatibility-policy.md](api-compatibility-policy.md). |

## Supabase and deployment settings the mobile app needs

Applied by the backend owner in the Supabase dashboard of **each** environment (details in [manual-setup.md](manual-setup.md)):

1. Authentication -> URL Configuration -> Redirect URLs: add the app's exact deep-link URLs (no wildcards, matching the backend's existing rule), for OAuth and for password reset.
2. Confirm the Google provider is enabled and `hook_restrict_iut_signup` is still the "Before User Created" hook.
3. Create the staging project and a staging deployment of `iutverse` with its own env vars and Redis.
4. Check Auth rate limits (sign-in, sign-up, reset), which the API's own limiter does not see.
5. Native requests send no `Origin` header, so `CORS_ORIGINS` needs no mobile entry. Do not add `*`.

## Notes for `docs/mobile-integration/auth.md`

- Every protected request: `Authorization: Bearer <supabase access_token>`.
- `GET /api/auth/me` is the membership gate; a valid Supabase session for a non-member is rejected by `authenticateToken`.
- Mobile uses PKCE for Google (the web client uses the implicit flow so password-reset links work on any device).
- Sign-up is limited to `@iut-dhaka.edu`.
- Signed file URLs expire (chat payload links: one hour); clients refetch on 401/403 from storage.

## Known inconsistency to confirm

The backend deployment guide says the GitHub default branch was still `master` in an earlier revision; the remote's HEAD is now `production` and `master` still exists. Confirm which branch backend PRs should target (`development` is assumed in [cross-repo-workflow.md](cross-repo-workflow.md)).
